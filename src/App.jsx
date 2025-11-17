import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase";
import ThemeToggle from "./components/ThemeToggle";
import AppRoutes from "./components/AppRoutes";

export default function App({ user, setUser, sessionRef }) {
  const [authLoaded, setAuthLoaded] = useState(false); // ✅ wait for Firebase
   const [theme, settheme] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const saved = localStorage.getItem("hc_user");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          sessionRef.current.token = idToken;
        } else if (parsed.token) {
          // fallback token
          sessionRef.current.token = parsed.token;
        }

        setUser({
          ...parsed,
          uid: parsed.uid || null,
          role: parsed.role || "user",
          getToken: () => sessionRef.current.token,
          logout: () => setUser(null),
        });
      } else {
        setUser(null);
        sessionRef.current.token = null;
      }

      setAuthLoaded(true); // Firebase check finished
    });

    return () => unsubscribe();
  }, [setUser, sessionRef]);

  if (!authLoaded) return <div>Loading...</div>; // wait before showing routes

  return (
    <BrowserRouter>
      <ThemeToggle user={user} onLogout={() => setUser(null)} settheme={settheme} />
      <AppRoutes user={user} setUser={setUser} theme={theme} />
    </BrowserRouter>
  );
}
