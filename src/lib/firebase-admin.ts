import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');

if (!admin.apps.length) {
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const fStore = admin.firestore();
export { admin };
