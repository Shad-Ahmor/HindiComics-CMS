import React, { useState, useEffect, createContext, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './App.css';
import { decryptData } from './utils/encryption.jsx'; // adjust path if needed

export const UserContext = createContext(null);

const container = document.getElementById('root');
const root = createRoot(container);

function RootWrapper() {
  const [user, setUser] = useState(null);
  const sessionRef = useRef({ token: null });

  // Load user from localStorage on mount (persistent across refresh)
  useEffect(() => {
    const saved = localStorage.getItem('hc_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restoredUser = {
          ...parsed,
          uid: parsed.uid ? decryptData(parsed.uid) : null,
          role: parsed.role ? decryptData(parsed.role) : 'user',
          getToken: () => sessionRef.current.token,
          logout: () => setUser(null),
        };
        sessionRef.current.token = parsed.token || null;
        setUser(restoredUser);
      } catch (err) {
        console.error("Failed to parse localStorage user:", err);
        localStorage.removeItem('hc_user');
      }
    }
  }, []);

  // Keep localStorage updated whenever user changes
  useEffect(() => {
    if (user) {
      const safeUser = {
        email: user.email,
        uid: user.uid,
        role: user.role,
        name: user.name,
        token: sessionRef.current.token, // store token for persistence
      };
      localStorage.setItem('hc_user', JSON.stringify(safeUser));
    } else {
      localStorage.removeItem('hc_user');
      sessionRef.current.token = null;
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, sessionRef }}>
      <App user={user} setUser={setUser} sessionRef={sessionRef} />
    </UserContext.Provider>
  );
}

root.render(
  <React.StrictMode>
    <RootWrapper />
  </React.StrictMode>
);
