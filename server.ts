import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import * as XLSX from "xlsx";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { admin, fStore } from "./src/lib/firebase-admin";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripe: Stripe | null = null;
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY variable is required");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.post(
    "/api/webhook/stripe",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event;

      try {
        event = getStripe().webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, cartId, purchasedItems } = session.metadata || {};
        
        if (userId) {
          try {
            if (purchasedItems) {
              const items = JSON.parse(purchasedItems);
              for (const item of items) {
                 if (item.sku === "cnpj_dossier" && item.cnpj) {
                    await fStore.collection("cnpjPurchases").add({
                      userId,
                      cnpj: item.cnpj.replace(/\D/g, ""),
                      paidAt: new Date().toISOString(),
                      amount: 4.99 // Standard price
                    });
                 }
                 
                 // General entitlement
                 await fStore.collection("entitlements").add({
                   userId,
                   productSlug: item.sku,
                   grantedAt: new Date().toISOString(),
                   status: 'active',
                   source: 'stripe',
                   cnpj: item.cnpj || null
                 });
              }
            }

            if (cartId) {
              await fStore.collection("carts").doc(cartId).update({ status: 'paid', paidAt: new Date().toISOString() });
            }
          } catch (e) {
            console.error("Firestore sync error:", e);
          }
        }
      }
      res.json({ received: true });
    }
  );

  app.use(express.json());

  // Seed test user - one time or on request
  app.post("/api/admin/seed-test-user", async (req, res) => {
    try {
      const testEmail = "teste@microcaas.com.br";
      const testPass = "178801";
      
      try {
        await admin.auth().getUserByEmail(testEmail);
        return res.json({ message: "User already exists" });
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          const user = await admin.auth().createUser({
            email: testEmail,
            password: testPass,
            displayName: "Test User"
          });
          
          await fStore.collection("users").doc(user.uid).set({
            name: "Test User",
            email: testEmail,
            plano: "free",
            status: "ativo",
            createdAt: new Date().toISOString()
          });
          
          return res.json({ message: "User created successfully" });
        }
        throw err;
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/create-preference", async (req, res) => {
    const { items, userId, userEmail } = req.body;
    try {
      const preference = new Preference(mpClient);
      const result = await preference.create({
        body: {
          items: items.map((i: any) => ({ 
            title: i.title || i.name || "Produto", 
            unit_price: i.price, 
            quantity: i.qty || 1, 
            currency_id: 'BRL' 
          })),
          metadata: { 
            userId, 
            itemSlugs: JSON.stringify(items.map((i: any) => i.sku || i.slug)) 
          },
          payer: { email: userEmail },
          back_urls: { success: `${req.headers.origin}/dashboard?success=true`, failure: `${req.headers.origin}/solutions?failure=true` },
          auto_return: 'approved'
        }
      });
      res.json({ id: result.id, init_point: result.init_point });
    } catch (e) {
      res.status(500).json({ error: "MP Error" });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    const { items, userId, userEmail } = req.body;
    try {
      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((i: any) => ({
          price_data: { 
            currency: 'brl', 
            product_data: { name: i.title || i.name || "Produto" }, 
            unit_amount: Math.round(i.price * 100) 
          },
          quantity: i.qty || 1,
        })),
        mode: "payment",
        success_url: `${req.headers.origin}/dashboard?success=true`,
        cancel_url: `${req.headers.origin}/solutions?canceled=true`,
        metadata: { 
          userId, 
          itemSlugs: JSON.stringify(items.map((i: any) => i.sku || i.slug)) 
        },
        customer_email: userEmail,
      });
      res.json({ url: session.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

// CNPJ Complete Consultation Implementation
  const memoryCache = new Map<string, { data: any, expires: number }>();
  const CNPJ_STATUS = {
    brasilapi: { ok: true, lastStatusCode: 0, lastErrorMessage: '' },
    opencnpj: { ok: true, lastStatusCode: 0, lastErrorMessage: '' },
    receitaws: { ok: true, lastStatusCode: 0, lastErrorMessage: '' }
  };

  app.get("/api/cnpj/health", (req, res) => {
    res.json({ sources: CNPJ_STATUS, timestamp: new Date().toISOString() });
  });

  app.get("/api/cnpj/lookup", async (req, res) => {
    const { cnpj, debug } = req.query;
    const isDebug = debug === '1';

    if (!cnpj) return res.status(400).json({ ok: false, error: "CNPJ é obrigatório" });
    
    const cleanCnpj = (cnpj as string).replace(/\D/g, "");
    if (cleanCnpj.length !== 14) return res.status(400).json({ ok: false, error: "CNPJ deve ter 14 dígitos" });

    const warnings: string[] = [];
    const errors: any[] = [];
    const sources: any = {};
    let cacheHit = false;

    try {
      // 1. Check Memory Cache
      const memCached = memoryCache.get(cleanCnpj);
      if (memCached && memCached.expires > Date.now()) {
        return res.json({ ...memCached.data, meta: { ...memCached.data.meta, cacheHit: true, from: 'memory' } });
      }

      // 2. Check Firestore Cache
      try {
        const cacheRef = fStore.collection("cnpjLookupCache").doc(cleanCnpj);
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          const data = cacheSnap.data();
          const fetchedAt = data?.meta?.fetchedAt?.toDate?.()?.getTime() || 0;
          const age = Date.now() - fetchedAt;
          if (age < 7 * 24 * 60 * 60 * 1000) { // 7 days cache
            cacheHit = true;
            return res.json({ ...data, meta: { ...data?.meta, cacheHit: true, from: 'firestore' } });
          }
        }
      } catch (fe: any) {
        warnings.push("cache_disabled_firestore_error");
        console.error("Firestore cache read error:", fe.message);
      }

      const rawData: any = {};
      const usedSources: string[] = [];

      // 3. Define Providers
      const providers = [
        {
          id: 'brasilapi',
          name: 'BrasilAPI',
          url: `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
          timeout: 6000,
          map: (d: any) => ({
            cnpj: cleanCnpj,
            razao_social: d.razao_social || 'N/A',
            nome_fantasia: d.nome_fantasia || '',
            situacao_cadastral: d.descricao_situacao_cadastral || d.situacao || 'N/A',
            data_situacao: d.data_situacao_cadastral || '',
            data_inicio_atividade: d.data_inicio_atividade || '',
            capital_social: d.capital_social,
            cnae_principal: { 
              codigo: d.cnae_fiscal || (d.atividade_principal?.[0]?.code) || '', 
              descricao: d.cnae_fiscal_descricao || (d.atividade_principal?.[0]?.text) || '' 
            },
            cnaes_secundarios: Array.isArray(d.cnaes_secundarios) 
              ? d.cnaes_secundarios.map((c: any) => ({ codigo: String(c.codigo || ''), descricao: String(c.descricao || '') }))
              : [],
            endereco: {
              logradouro: d.logradouro || '',
              numero: d.numero || '',
              complemento: d.complemento || '',
              bairro: d.bairro || '',
              municipio: d.municipio || '',
              uf: d.uf || '',
              cep: d.cep || ''
            },
            contatos: { 
              telefones: [d.ddd_telefone_1, d.ddd_telefone_2].filter(Boolean).map(String), 
              email: d.email || '' 
            },
            qsa: Array.isArray(d.qsa) 
              ? d.qsa.map((q: any) => ({
                nome: q.nome_socio || q.nome || '',
                qualificacao: q.qualificacao_socio || q.qualificacao || '',
                data_entrada: q.data_entrada_sociedade || '',
                documento_mascarado: q.cnpj_cpf_do_socio || ''
              }))
              : []
          })
        },
        {
          id: 'opencnpj',
          name: 'OpenCNPJ',
          url: `https://api.opencnpj.org/${cleanCnpj}`,
          timeout: 8000,
          map: (d: any) => ({
             razao_social: d.razao_social || d.nome,
             nome_fantasia: d.nome_fantasia || d.fantasia,
             simples: d.opcao_pelo_simples ? "Sim" : "Não",
             mei: d.opcao_pelo_mei ? "Sim" : "Não",
             capital_social: d.capital_social
          })
        },
        {
          id: 'receitaws',
          name: 'ReceitaWS',
          url: `https://receitaws.com.br/v1/cnpj/${cleanCnpj}`,
          timeout: 5000,
          map: (d: any) => ({
            razao_social: d.nome,
            capital_social: d.capital_social,
            porte: d.porte,
            natureza_juridica: d.natureza_juridica
          })
        }
      ];

      let consolidated: any = {};

      // Execute sequentially
      for (const p of providers) {
        try {
          const resp = await axios.get(p.url, { timeout: p.timeout });
          
          CNPJ_STATUS[p.id as keyof typeof CNPJ_STATUS] = { ok: true, lastStatusCode: resp.status, lastErrorMessage: '' };
          sources[p.id] = { ok: true, status: resp.status, dataOrError: resp.data };

          if (resp.data && !resp.data.error && resp.data.status !== 'ERROR') {
            rawData[p.id] = resp.data;
            const mapped = p.map(resp.data);
            
            if (p.id === 'brasilapi' || !consolidated.cnpj) {
               // Initial set or BrasilAPI priority
               consolidated = { ...mapped, ...consolidated };
               if (p.id === 'brasilapi') consolidated = mapped;
            } else {
               // Fill gaps
               Object.keys(mapped).forEach(k => {
                 if (!consolidated[k] || (typeof consolidated[k] === 'string' && consolidated[k] === '')) {
                   consolidated[k] = mapped[k];
                 }
               });
            }
            usedSources.push(p.name);
          } else if (resp.data.error || resp.data.status === 'ERROR') {
            errors.push({ source: p.name, status: resp.status, message: resp.data.message || resp.data.error });
            sources[p.id].ok = false;
          }
        } catch (e: any) {
          const status = e.response?.status || 500;
          const msg = e.response?.data?.message || e.message;
          CNPJ_STATUS[p.id as keyof typeof CNPJ_STATUS] = { ok: false, lastStatusCode: status, lastErrorMessage: msg };
          sources[p.id] = { ok: false, status, dataOrError: msg };
          errors.push({ source: p.name, status, message: msg });
          warnings.push(`${p.name} falhou: ${msg}`);
        }
      }

      const ok = !!consolidated.cnpj;
      
      const finalResponse = {
        ok,
        cnpj: cleanCnpj,
        profile: ok ? consolidated : null,
        warnings,
        errors,
        sources,
        meta: {
          cacheHit: false,
          fetchedAt: new Date().toISOString(),
          usedSources
        },
        ...(isDebug ? { debugInfo: { steps: usedSources, rawData } } : {})
      };

      if (ok) {
        // Save to memory cache
        memoryCache.set(cleanCnpj, { data: finalResponse, expires: Date.now() + 10 * 60 * 1000 }); // 10 min memory
        
        // Save to Firestore Cache
        try {
          const cacheRef = fStore.collection("cnpjLookupCache").doc(cleanCnpj);
          await cacheRef.set({
            ...finalResponse,
            meta: {
              ...finalResponse.meta,
              fetchedAt: admin.firestore.FieldValue.serverTimestamp()
            }
          });
        } catch (fsErr) {
          console.error("Firestore save error:", fsErr);
        }
      }

      return res.json(finalResponse);

    } catch (e: any) {
      console.error("CNPJ Lookup Critical Error:", e);
      return res.status(500).json({ 
        ok: false, 
        error: "Erro na orquestração da consulta", 
        message: e.message,
        warnings,
        errors,
        sources,
        ...(isDebug ? { stack: e.stack } : {})
      });
    }
  });

  app.get("/api/cnpj/governo", async (req, res) => {
    const { cnpj } = req.query;
    if (!cnpj) return res.status(400).json({ error: "CNPJ é obrigatório" });
    
    // Simulate lookup in portals like Portal da Transparência
    // In a real scenario, this would scrape or use Gov APIs
    const cnpjSeed = parseInt((cnpj as string).replace(/\D/g, "").slice(0, 8)) || 0;
    const hasRel = (cnpjSeed % 7 === 0); // Deterministic simulation

    res.json({
      hasGovernmentRelation: hasRel,
      contractsCount: hasRel ? (cnpjSeed % 15) + 1 : 0,
      estimatedValue: hasRel ? (cnpjSeed % 1000000) + 50000 : 0,
      entities: hasRel ? ["Prefeitura Municipal", "Estado/Secretaria", "Fundo Nacional"].slice(0, (cnpjSeed % 3) + 1) : []
    });
  });

  // Check if user has paid for a specific CNPJ
  app.get("/api/cnpj/check-access", async (req, res) => {
    const { cnpj, userId } = req.query;
    if (!cnpj || !userId) return res.json({ hasPaid: false });

    try {
      const purchaseRef = fStore.collection("cnpjPurchases")
        .where("userId", "==", userId)
        .where("cnpj", "==", (cnpj as string).replace(/\D/g, ""))
        .limit(1);
      const snap = await purchaseRef.get();
      res.json({ hasPaid: !snap.empty });
    } catch (e) {
      res.json({ hasPaid: false });
    }
  });

  app.get("/api/cnpj/pdf", async (req, res) => {
    const { cnpj, cartId, userId } = req.query;
    if (!cnpj) return res.status(400).json({ error: "CNPJ é obrigatório" });
    
    // Check if user has access (already paid)
    try {
      let hasPaid = false;
      if (userId) {
        const snap = await fStore.collection("cnpjPurchases")
          .where("userId", "==", userId)
          .where("cnpj", "==", (cnpj as string).replace(/\D/g, ""))
          .limit(1).get();
        if (!snap.empty) hasPaid = true;
      }
      
      if (!hasPaid) return res.status(403).json({ error: "Acesso negado. Compre o dossiê para baixar o PDF." });

      // Simulated PDF Generation - in a real app, use PDFKit or Puppeteer
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Dossie_${cnpj}.pdf`);
      res.send(Buffer.from("SIMULATED_PDF_CONTENT_FOR_" + cnpj));
    } catch (e) {
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });

  // CART API
  app.get("/api/cart/get", async (req, res) => {
    const { cartId } = req.query;
    if (!cartId) return res.json({ items: [], totals: { total: 0 } });
    
    try {
      const snap = await fStore.collection("carts").doc(cartId as string).get();
      if (!snap.exists) return res.json({ items: [], totals: { total: 0 } });
      res.json(snap.data());
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar carrinho" });
    }
  });

  app.post("/api/cart/add", async (req, res) => {
    const { cartId, sku, title, price, qty, metadata, context } = req.body;
    const id = cartId || Math.random().toString(36).substring(7);
    
    try {
      const cartRef = fStore.collection("carts").doc(id);
      const snap = await cartRef.get();
      let cartData = snap.exists ? snap.data() : { items: [], totals: { total: 0 }, createdAt: new Date().toISOString() };
      
      const items = cartData?.items || [];
      // Check for duplicates of same CNPJ dossier
      const existingIndex = items.findIndex((i: any) => i.sku === sku && i.metadata?.cnpj === metadata?.cnpj);
      
      if (existingIndex > -1) {
        items[existingIndex].qty += (qty || 1);
      } else {
        items.push({ sku, title, price, qty: qty || 1, metadata: metadata || {} });
      }
      
      const total = items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
      const updatedData = { 
        ...cartData, 
        items, 
        context: context || cartData?.context || {},
        totals: { total }, 
        updatedAt: new Date().toISOString(), 
        cartId: id 
      };
      
      await cartRef.set(updatedData);
      res.json(updatedData);
    } catch (e) {
      res.status(500).json({ error: "Erro ao adicionar ao carrinho" });
    }
  });

  app.post("/api/cart/remove", async (req, res) => {
    const { cartId, index } = req.body;
    try {
      const cartRef = fStore.collection("carts").doc(cartId);
      const snap = await cartRef.get();
      if (!snap.exists) return res.status(404).json({ error: "Carrinho não encontrado" });
      
      let cartData = snap.data();
      let items = cartData?.items || [];
      items.splice(index, 1);
      
      const total = items.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
      const updatedData = { ...cartData, items, totals: { total }, updatedAt: new Date().toISOString() };
      
      await cartRef.set(updatedData);
      res.json(updatedData);
    } catch (e) {
      res.status(500).json({ error: "Erro ao remover do carrinho" });
    }
  });

  app.post("/api/cart/clear", async (req, res) => {
    const { cartId } = req.body;
    try {
      await fStore.collection("carts").doc(cartId).delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao limpar carrinho" });
    }
  });

  // Updated Generic Checkout
  app.post("/api/checkout/create", async (req, res) => {
    const { cartId, userId, userEmail, gateway } = req.body;
    if (!cartId) return res.status(400).json({ error: "Cart ID é obrigatório" });

    try {
      const cartSnap = await fStore.collection("carts").doc(cartId).get();
      if (!cartSnap.exists) return res.status(404).json({ error: "Carrinho vazio ou não encontrado" });
      const cartData = cartSnap.data();
      const items = cartData?.items || [];

      if (gateway === "mercado_pago") {
        const preference = new Preference(mpClient);
        const result = await preference.create({
          body: {
            items: items.map((i: any) => ({
              title: i.title,
              unit_price: i.price,
              quantity: i.qty,
              currency_id: 'BRL'
            })),
            metadata: { 
              userId, 
              cartId,
              purchasedItems: JSON.stringify(items.map((i: any) => ({ sku: i.sku, cnpj: i.metadata?.cnpj })))
            },
            payer: { email: userEmail },
            back_urls: { 
              success: `${req.headers.origin}/solutions/cnae-radar?success=true&cartId=${cartId}`, 
              failure: `${req.headers.origin}/solutions/cnae-radar?error=true` 
            },
            auto_return: 'approved'
          }
        });
        return res.json({ checkoutUrl: result.init_point });
      }

      // Default to Stripe
      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((i: any) => ({
          price_data: {
            currency: 'brl',
            product_data: {
              name: i.title,
              description: i.metadata?.cnpj ? `CNPJ: ${i.metadata.cnpj}` : undefined
            },
            unit_amount: Math.round(i.price * 100),
          },
          quantity: i.qty,
        })),
        mode: "payment",
        success_url: `${req.headers.origin}/solutions/cnae-radar?success=true&cartId=${cartId}&sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/solutions/cnae-radar?canceled=true`,
        metadata: { 
          userId: userId || 'anonymous', 
          cartId,
          purchasedItems: JSON.stringify(items.map((i: any) => ({ sku: i.sku, cnpj: i.metadata?.cnpj })))
        },
        customer_email: userEmail,
      });

      res.json({ checkoutUrl: session.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // AI Chat Route
  app.post("/api/ai/chat", async (req, res) => {
    const { prompt, history } = req.body;
    
    try {
      const { getGeminiResponse } = await import("./src/lib/gemini");
      const response = await getGeminiResponse(prompt, history);
      res.json({ response });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Erro ao processar sua dúvida." });
    }
  });

  // NFe Consulta
  app.post("/api/nfe/consulta", async (req, res) => {
    const { chave, userId } = req.body;
    const apiKey = process.env.MEUDANFE_API_KEY;
    const cleanChave = chave?.replace(/\D/g, "");

    if (!cleanChave || cleanChave.length !== 44) return res.status(400).json({ error: "Chave inválida" });

    try {
      let data;
      if (!apiKey) {
        data = { emitente: "SANDBOX SA", valor: 100.0, data: new Date().toISOString(), status: "Autorizada (Sandbox)" };
      } else {
        const response = await fetch("https://api.meudanfe.com.br/v2/nfe/consulta", {
          method: "POST", headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ chave: cleanChave })
        });
        data = await response.json();
      }

      if (userId && userId !== 'anonymous') {
        await fStore.collection("documents").add({ ...data, ownerId: userId, type: 'nfe_consulta', chave: cleanChave, timestamp: admin.firestore.FieldValue.serverTimestamp() });
      }
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Consulta Error" });
    }
  });
// CNAE Radar Implementation
  const cnaeMetadataCache: any[] = [];
  
  const CNAE_RADAR_STATUS = {
    dados_brasil: {
      ok: true,
      lastStatusCode: 0,
      lastErrorMessage: '',
      lastUrl: '',
      lastFetchedAt: '',
      lastResponseSnippet: ''
    }
  };

  const ENRICHER_CONFIG = {
    cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  async function enrichCompany(cnpj: string) {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    // 1. Check Firestore Cache
    const cacheRef = fStore.collection("cnpjCache").doc(cleanCnpj);
    const cacheSnap = await cacheRef.get();
    
    if (cacheSnap.exists) {
      const data = cacheSnap.data();
      const age = Date.now() - (data?.updated_at?.toDate?.()?.getTime() || 0);
      if (age < ENRICHER_CONFIG.cacheTTL) {
        return { ...data, from_cache: true };
      }
    }

    // 2. Orchestrate Providers with Fallback
    const providers = [
      { 
        name: 'OpenCNPJ', 
        url: `https://api.opencnpj.org/${cleanCnpj}`,
        map: (d: any) => ({
          cnpj: cleanCnpj,
          razao_social: d.razao_social || d.nome,
          nome_fantasia: d.nome_fantasia || d.fantasia,
          situacao_cadastral: d.situacao_cadastral_descricao || d.situacao,
          data_inicio_atividade: d.data_inicio_atividade || d.abertura,
          cnae_principal: {
            codigo: d.cnae_fiscal || (d.atividade_principal?.[0]?.code),
            descricao: d.cnae_fiscal_descricao || (d.atividade_principal?.[0]?.text)
          },
          endereco_completo: `${d.logradouro}, ${d.numero} - ${d.bairro}, ${d.municipio}-${d.uf}`,
          uf: d.uf,
          municipio: d.municipio,
          telefones: d.telefone || d.ddd_telefone_1,
          email: d.email,
          capital_social: d.capital_social,
          porte: d.porte,
          qsa: d.qsa || []
        })
      },
      { 
        name: 'BrasilAPI', 
        url: `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
        map: (d: any) => ({
          cnpj: cleanCnpj,
          razao_social: d.razao_social || d.nome,
          nome_fantasia: d.nome_fantasia || d.fantasia,
          situacao_cadastral: d.descricao_situacao_cadastral || d.situacao,
          data_inicio_atividade: d.data_inicio_atividade || d.abertura,
          cnae_principal: {
            codigo: d.cnae_fiscal || (d.atividade_principal?.[0]?.code),
            descricao: d.cnae_fiscal_descricao || (d.atividade_principal?.[0]?.text)
          },
          endereco_completo: `${d.logradouro}, ${d.numero} - ${d.bairro}, ${d.municipio}-${d.uf}`,
          uf: d.uf,
          municipio: d.municipio,
          telefones: d.ddd_telefone_1 || d.telefone,
          email: d.email,
          capital_social: d.capital_social,
          porte: d.porte,
          qsa: d.qsa || []
        })
      }
    ];

    let combined: any = null;
    const usedSources: string[] = [];

    for (const p of providers) {
      try {
        const resp = await axios.get(p.url, { timeout: 5000 });
        if (resp.data && !resp.data.error) {
          const mapped = p.map(resp.data);
          if (!combined) {
            combined = mapped;
          } else {
            Object.keys(mapped).forEach(k => {
              if (!combined[k] || combined[k] === 'N/A') {
                combined[k] = mapped[k];
              }
            });
          }
          usedSources.push(p.name);
        }
      } catch (e: any) {
        console.error(`Provider ${p.name} failed:`, e.message);
      }
    }

    if (!combined) return null;

    combined.fontes_usadas = usedSources;
    combined.updated_at = admin.firestore.FieldValue.serverTimestamp();

    await cacheRef.set(combined);
    return { ...combined, from_cache: false };
  }

  app.get("/api/cnae-radar/metadata/cnaes", async (req, res) => {
    try {
      if (cnaeMetadataCache.length > 0) return res.json(cnaeMetadataCache);
      console.log("Fetching CNAE metadata from IBGE...");
      const response = await axios.get("https://servicodados.ibge.gov.br/api/v2/cnae/subclasses", { timeout: 20000 });
      if (Array.isArray(response.data)) {
        const simplified = response.data.map((item: any) => ({
          code: item.id.replace(/\D/g, ""),
          description: item.descricao
        }));
        cnaeMetadataCache.push(...simplified);
        res.json(simplified);
      }
    } catch (e: any) {
      res.json([]);
    }
  });

  app.get("/api/cnae/suggest", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const term = (q as string).toLowerCase();
    const suggestions = cnaeMetadataCache
      .filter(c => c.code.includes(term) || c.description.toLowerCase().includes(term))
      .slice(0, 50);
    res.json(suggestions);
  });

  app.get("/api/cnae-radar/health", async (req, res) => {
    res.json({ provider_dadosbrasil: CNAE_RADAR_STATUS.dados_brasil, timestamp: new Date().toISOString() });
  });

  app.get("/api/cnae-radar/selftest", async (req, res) => {
    try {
      const testCnae = "6920601";
      const targetUrl = `https://www.dadosbrasil.net/pt/cnaes/${testCnae}`;
      const response = await axios.get(targetUrl, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(response.data);
      const leadCount = $('a[href*="/pt/cnpj/"]').length;
      res.json({ ok: leadCount > 0, leadCount, providerStatus: response.status, lastUrl: targetUrl });
    } catch (e: any) {
      res.json({ ok: false, providerStatus: e.response?.status || 500, lastErrorMessage: e.message });
    }
  });

  app.get("/api/cnae-radar/search", async (req, res) => {
    const { cnae, uf, userId } = req.query;
    if (!cnae) return res.status(400).json({ error: "CNAE obrigatório" });
    const cleanCnae = (cnae as string).replace(/\D/g, "");
    if (cleanCnae.length !== 7) return res.status(400).json({ error: "CNAE deve ter 7 dígitos" });

    const targetUrl = `https://www.dadosbrasil.net/pt/cnaes/${cleanCnae}`;
    try {
      let hasPaid = false;
      if (userId && userId !== 'undefined' && userId !== 'null') {
        const entSnap = await fStore.collection('entitlements')
          .where('userId', '==', userId)
          .where('productSlug', '==', 'cnae-radar')
          .where('status', '==', 'active')
          .limit(1).get();
        if (!entSnap.empty) hasPaid = true;

        const purSnap = await fStore.collection('purchases')
          .where('userId', '==', userId)
          .where('product', '==', 'cnae-radar')
          .where('status', '==', 'paid')
          .limit(1).get();
        if (!purSnap.empty) hasPaid = true;
      }

      CNAE_RADAR_STATUS.dados_brasil.lastUrl = targetUrl;
      CNAE_RADAR_STATUS.dados_brasil.lastFetchedAt = new Date().toISOString();

      const response = await axios.get(targetUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        }
      });

      CNAE_RADAR_STATUS.dados_brasil.ok = true;
      CNAE_RADAR_STATUS.dados_brasil.lastStatusCode = response.status;
      CNAE_RADAR_STATUS.dados_brasil.lastResponseSnippet = (response.data as string).substring(0, 500);

      const $ = cheerio.load(response.data);
      const leads: any[] = [];
      
      $('a[href*="/pt/cnpj/"]').each((i, el) => {
        const row = $(el).closest('div, tr, li');
        const text = row.text().trim();
        const href = $(el).attr('href') || '';
        const cnpjMatch = text.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/) || href.match(/\d{14}/);
        
        if (cnpjMatch) {
          const rawCnpj = cnpjMatch[0].replace(/\D/g, "");
          const formattedCnpj = rawCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
          const foundUf = text.match(/\b([A-Z]{2})\b/)?.[1] || "BR";

          if (uf && foundUf !== uf.toString().toUpperCase()) return;

          leads.push({
            cnpj: formattedCnpj,
            name: $(el).text().trim().replace(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\s*-\s*/, '') || "Empresa Identificada",
            uf: foundUf,
            data_inicio: "Recém Aberta",
            cnae: cleanCnae
          });
        }
      });

      const limit = hasPaid ? 100 : 5;
      const finalLeads = leads.slice(0, limit).map((r, i) => ({ ...r, locked: !hasPaid && i >= 5 }));

      res.json({ totalFound: leads.length, results: finalLeads, price: 9.90 });
    } catch (e: any) {
      CNAE_RADAR_STATUS.dados_brasil.ok = false;
      CNAE_RADAR_STATUS.dados_brasil.lastStatusCode = e.response?.status || 500;
      CNAE_RADAR_STATUS.dados_brasil.lastErrorMessage = e.message;
      res.status(500).json({ error: "Search Error", message: e.message, url: targetUrl });
    }
  });

  app.get("/api/cnae-radar/enrich", async (req, res) => {
    const { cnpj } = req.query;
    if (!cnpj) return res.status(400).json({ error: "CNPJ obrigatório" });
    try {
      const enriched = await enrichCompany(cnpj as string);
      if (!enriched) return res.status(404).json({ error: "Empresa não encontrada" });
      res.json(enriched);
    } catch (e: any) {
      res.status(500).json({ error: "Enrichment Error", message: e.message });
    }
  });

  app.get("/api/cnae-radar/export", async (req, res) => {
    const { cnae, userId } = req.query;
    if (!userId) return res.status(401).json({ error: "Login necessário" });

    try {
      // Check payment
      const entitlementSnap = await fStore.collection('entitlements')
        .where('userId', '==', userId)
        .where('productSlug', '==', 'cnae-radar')
        .where('status', '==', 'active')
        .get();
      
      const purchaseSnap = await fStore.collection('purchases')
        .where('userId', '==', userId)
        .where('product', '==', 'cnae-radar')
        .where('status', '==', 'paid')
        .get();

      if (entitlementSnap.empty && purchaseSnap.empty) {
        return res.status(403).json({ error: "Compra necessária para exportar" });
      }

      // Fetch all (up to 100)
      const targetUrl = `https://www.dadosbrasil.net/pt/cnaes/${cnae}`;
      const response = await axios.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(response.data);
      const results: any[] = [];
      
      $('a[href*="/pt/cnpj/"]').each((i, el) => {
        if (results.length >= 100) return;
        const row = $(el).closest('div, tr, li');
        const text = row.text().trim();
        const cnpjMatch = text.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
        if (cnpjMatch) {
          const ufMatch = text.match(/\b([A-Z]{2})\b/);
          results.push({
            'CNPJ': cnpjMatch[0],
            'Razão Social': $(el).text().trim().replace(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\s*-\s*/, ''),
            'UF': ufMatch ? ufMatch[1] : "BR",
            'Tipo': 'Ativa',
            'CNAE': cnae
          });
        }
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(results);
      XLSX.utils.book_append_sheet(wb, ws, "Empresas");
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=CNAE_${cnae}_Radar.xlsx`);
      res.send(buffer);
    } catch (e) {
      res.status(500).json({ error: "Export Error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Auto-seed on start
    try {
      const testEmail = "teste@microcaas.com.br";
      const testPass = "178801";
      try {
        await admin.auth().getUserByEmail(testEmail);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          const user = await admin.auth().createUser({
            email: testEmail,
            password: testPass,
            displayName: "Test User"
          });
          await fStore.collection("users").doc(user.uid).set({
            name: "Test User",
            email: testEmail,
            plano: "free",
            status: "ativo",
            createdAt: new Date().toISOString()
          });
          console.log("Test user seeded successfully");
        }
      }
    } catch (e) {
      console.error("Seed error:", e);
    }
  });
}

startServer();
