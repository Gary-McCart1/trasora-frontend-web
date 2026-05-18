import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  measurementId: "G-XXXXXXXX"
};

const app = initializeApp(firebaseConfig);

// IMPORTANT: only runs in browser
const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export { analytics, logEvent };