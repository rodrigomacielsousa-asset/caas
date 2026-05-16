import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase config for Admin SDK
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const fStore = admin.firestore();

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
        const { userId, itemSlugs, planTier } = session.metadata || {};
        
        if (userId) {
          try {
            if (planTier) {
              await fStore.collection("users").doc(userId).update({ plano: planTier, status: 'ativo' });
            }
            if (itemSlugs) {
              const slugs = JSON.parse(itemSlugs);
              for (const slug of slugs) {
                await fStore.collection("entitlements").add({
                  userId,
                  productSlug: slug,
                  grantedAt: new Date().toISOString(),
                  status: 'active',
                  source: 'stripe'
                });
              }
            }
            
            const requests = await fStore.collection("checkoutRequests")
              .where("userEmail", "==", session.customer_details?.email)
              .where("status", "==", "pending")
              .limit(1)
              .get();
            
            if (!requests.empty) {
              await requests.docs[0].ref.update({ status: 'paid', totalValue: session.amount_total ? session.amount_total / 100 : 0 });
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
          items: items.map((i: any) => ({ title: i.name, unit_price: i.price, quantity: 1, currency_id: 'BRL' })),
          metadata: { userId, itemSlugs: JSON.stringify(items.map((i: any) => i.slug)) },
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
          price_data: { currency: 'brl', product_data: { name: i.name }, unit_amount: Math.round(i.price * 100) },
          quantity: 1,
        })),
        mode: "payment",
        success_url: `${req.headers.origin}/dashboard?success=true`,
        cancel_url: `${req.headers.origin}/solutions?canceled=true`,
        metadata: { userId, itemSlugs: JSON.stringify(items.map((i: any) => i.slug)) },
        customer_email: userEmail,
      });
      res.json({ url: session.url });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
