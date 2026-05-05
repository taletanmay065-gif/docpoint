import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY is missing. Falling back to mock mode.");
      return null;
    }
    stripe = new Stripe(key);
  }
  return stripe;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || 'development' });
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    const { amount, appointmentId } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      // Mock success if key is missing (for preview demo purposes)
      return res.json({ 
        success: true, 
        clientSecret: "mock_secret_" + Math.random().toString(36).substr(2, 9),
        isMock: true 
      });
    }

    try {
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: amount * 100, // Stripe expects amounts in cents
        currency: "inr",
        metadata: { appointmentId },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mock-payment", (req, res) => {
    // Simulate payment processing
    setTimeout(() => {
      res.json({ success: true, transactionId: "TXN_" + Math.random().toString(36).substr(2, 9) });
    }, 1000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.resolve(__dirname, "dist");
    console.log(`Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexFile = path.resolve(distPath, "index.html");
      console.log(`Fallback: serving ${indexFile}`);
      res.sendFile(indexFile);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
