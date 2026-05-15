import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import admin from "firebase-admin";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In AI Studio environment, this will pick up the correct credentials if set up
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0298718650",
  });
}

const fStore = admin.firestore();
// If a specific database is needed, it can be set on the Firestore instance in some environments,
// but usually admin.firestore() is sufficient for the default database.

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required for this operation.");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Webhook needs raw body
  app.post(
    "/api/webhook",
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
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const planTier = session.metadata?.planTier || "pro";

          if (userId) {
            try {
              console.log(`Updating plan for user ${userId} to ${planTier}`);
              
              // Update user record
              await fStore.collection("users").doc(userId).update({
                plano: planTier,
                status: "ativo",
                stripeCustomerId: session.customer as string,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              // Update userPlans record with active modules and limits
              const limitsMap: Record<string, any> = {
                free: { clients: 1, docsPerMonth: 50, activeModules: ["receiptor", "extrato"] },
                pro: { clients: 10, docsPerMonth: 500, activeModules: ["receiptor", "extrato", "closure", "insight"] },
                advanced: { clients: 50, docsPerMonth: 2000, activeModules: ["receiptor", "extrato", "closure", "insight", "billing", "portal"] },
                enterprise: { clients: 999, docsPerMonth: 9999, activeModules: ["receiptor", "extrato", "closure", "insight", "billing", "portal", "cobra"] }
              };

              const planData = limitsMap[planTier] || limitsMap.pro;

              await fStore.collection("userPlans").doc(userId).set({
                tier: planTier,
                activeModules: planData.activeModules,
                limits: {
                  clients: planData.clients,
                  docsPerMonth: planData.docsPerMonth
                },
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });

              // Update Growth Funnel Stage
              await fStore.collection("userMetrics").doc(userId).set({
                funnelStage: planTier === "enterprise" ? "usuario_premium" : "usuario_pagante",
                lastActive: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });

              console.log(`Successfully updated plan for user ${userId}`);
            } catch (err) {
              console.error("Error updating Firestore:", err);
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          try {
            const userSnap = await fStore.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
            if (!userSnap.empty) {
              const userDoc = userSnap.docs[0];
              await userDoc.ref.update({
                status: "cancelado",
                plano: "free"
              });
              
              await fStore.collection("userPlans").doc(userDoc.id).update({
                tier: "free",
                activeModules: ["receiptor", "extrato"],
                limits: { clients: 1, docsPerMonth: 50 }
              });
            }
          } catch (err) {
            console.error("Error handling subscription deletion:", err);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    }
  );

  app.use(express.json());

  // NFe Consulta Real API Integration
  app.post("/api/nfe/consulta", async (req, res) => {
    const { chave, userId } = req.body;
    const apiKey = process.env.MEUDANFE_API_KEY;

    if (!chave || chave.replace(/\D/g, "").length !== 44) {
      return res.status(400).json({ error: "Chave inválida. Deve conter 44 dígitos." });
    }

    const cleanChave = chave.replace(/\D/g, "");

    try {
      // Sandbox mode / Development fallback if API key is missing
      if (!apiKey) {
        console.warn("MEUDANFE_API_KEY missing - using sandbox mode");
        const sandboxData = {
          chave: cleanChave,
          emitente: "EMPRESA SANDBOX LTDA",
          valor: 1250.80,
          data: new Date().toISOString(),
          status: "Autorizada (Sandbox)",
          xml: `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe id="NFe${cleanChave}"><emit><xNome>EMPRESA SANDBOX LTDA</xNome></emit><total><ICMSTot><vNF>1250.80</vNF></ICMSTot></total></infNFe></NFe></nfeProc>`,
          origem: "sandbox",
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        return res.json(sandboxData);
      }

      const response = await fetch("https://api.meudanfe.com.br/v2/nfe/consulta", {
        method: "POST",
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chave: cleanChave })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("MeuDanfe API Error:", errorData);
        return res.status(response.status).json({ 
          error: "Nota não encontrada ou indisponível no servidor nacional.",
          type: "nfe_not_found",
          details: errorData 
        });
      }

      const data: any = await response.json();
      
      const modeledData = {
        chave: cleanChave,
        emitente: data.emitente || "Não identificado",
        destinatario: data.destinatario || "Não identificado",
        valor: data.valor || 0,
        data: data.data_emissao || new Date().toISOString(),
        status: data.status || "Autorizada",
        xml: data.xml || "",
        pdf_url: data.pdf_url || "",
        origem: "meu_danfe_v2",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      // Save to Data Hub
      if (userId && userId !== 'anonymous') {
        const docRef = await fStore.collection("documents").add({
          ...modeledData,
          ownerId: userId,
          type: 'nfe_consulta'
        });

        // Track usage
        const now = new Date();
        const monthId = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const usageRef = fStore.collection("nfeUsage").doc(userId);
        
        await fStore.runTransaction(async (transaction) => {
          const doc = await transaction.get(usageRef);
          if (!doc.exists || doc.data()?.month !== monthId) {
            transaction.set(usageRef, { month: monthId, count: 1, lastAction: admin.firestore.FieldValue.serverTimestamp() });
          } else {
            transaction.update(usageRef, { count: (doc.data()?.count || 0) + 1, lastAction: admin.firestore.FieldValue.serverTimestamp() });
          }
        });
      }

      res.json(modeledData);
    } catch (error: any) {
      console.error("Internal Consulta Error:", error);
      res.status(500).json({ error: "Erro interno ao processar consulta" });
    }
  });

  // API Routes
  app.post("/api/events", async (req, res) => {
    const { userId, productId, action, metadata } = req.body;
    try {
      await fStore.collection("trackingEvents").add({
        userId: userId || "anonymous",
        productId,
        action,
        metadata,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ status: "ok" });
    } catch (err) {
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.post("/api/monitor/sync", async (req, res) => {
    const { clientId, userId } = req.body;
    if (!clientId || !userId) return res.status(400).json({ error: "Missing params" });

    try {
      const clientRef = fStore.collection("nfeMonitoredClients").doc(clientId);
      const clientSnap = await clientRef.get();
      if (!clientSnap.exists) return res.status(404).json({ error: "Client not found" });

      // Simulated sync logic
      const lastNSU = clientSnap.data()?.ultNSU || "0";
      const newNSU = (parseInt(lastNSU) + 1).toString();

      // Create a mock document detected
      const docId = `monitor_${Date.now()}`;
      await fStore.collection("documents").doc(docId).set({
        ownerId: userId,
        clientId,
        chave: "352310" + Math.random().toString().substring(2, 40),
        emitente: "AUTO SYNC S/A",
        valor: 100 + Math.random() * 1000,
        data: new Date().toISOString(),
        status: "Recebida via Sync",
        origem: "monitor",
        type: "nfe",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      await clientRef.update({ ultNSU: newNSU, lastSync: admin.firestore.FieldValue.serverTimestamp() });

      res.json({ status: "synced", newNSU, docId });
    } catch (err) {
      res.status(500).json({ error: "Sync failed" });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    const { priceId, userId, userEmail, planTier } = req.body;

    if (!userId || !priceId) {
      return res.status(400).json({ error: "Missing userId or priceId" });
    }

    try {
      const stripeInstance = getStripe();
      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/dashboard?canceled=true`,
        metadata: {
          userId,
          planTier: planTier || "pro"
        },
        customer_email: userEmail,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
