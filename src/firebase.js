import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDQMYwKTt05hfSPW-Trl7NYPGyDFKA76dQ",
  authDomain: "golf-ciudad-real-50819.firebaseapp.com",
  projectId: "golf-ciudad-real-50819",
  storageBucket: "golf-ciudad-real-50819.firebasestorage.app",
  messagingSenderId: "447720199984",
  appId: "1:447720199984:web:312a8a1140d95554821af5",
};

const app = initializeApp(firebaseConfig);
// App Check (Fraud Defense / reCAPTCHA Enterprise): comprueba que las peticiones vienen de las webs reales de Golf B.
// Modo vigilar: no bloquea nada hasta que se active el cumplimiento en la consola de Firebase.
try {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider("6LeXiBsuAAAAAODBncyVXD11bnAMYF_AaiIwvktu"), isTokenAutoRefreshEnabled: true });
} catch (e) { console.warn("App Check:", e); }

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const leerTicketIA = httpsCallable(functions, "leerTicketIA");
export const storage = getStorage(app);