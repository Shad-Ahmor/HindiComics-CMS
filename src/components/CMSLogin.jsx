import React, { useState, useRef } from "react";
import { LogIn, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithEmailAndPassword } from "./firebase"; 

import "../styles/login.css";
import "../styles/Login.css";
import "../styles/Sidebar.css";

export default function CMSLogin({ onLogin ,setUseruidRole}) {
  const [email, setEmail] = useState("admin@hindicomics.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const sessionRef = useRef({ token: null });
  const refreshInterval = useRef(null);

  const handleLogout = () => {
    clearInterval(refreshInterval.current);
    sessionRef.current = { token: null };
    onLogin(null);
    navigate("/login", { replace: true });
  };

  const startTokenRefresh = async (user) => {
    refreshInterval.current = setInterval(async () => {
      try {
        const idToken = await user.getIdToken(true);
        sessionRef.current.token = idToken;
      } catch (err) {
        console.error("Token refresh failed:", err);
        handleLogout();
      }
    }, 30 * 60 * 1000);
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setOpenSnackbar(false);

    try {
      // Backend login
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid Credentials");

      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      const cleanedFirstName = email.split("@")[0].split(".")[0].replace(/[^a-zA-Z]/g, "");

      const userRoleData = {
        uid: data.user.uid,
        role: data.user.role,
        name: cleanedFirstName,
        subrole: data.user.subrole,
        courses: data.user.courses,
        profile: data.user.image,
      };

      setUseruidRole(userRoleData);
      localStorage.setItem("hc_user_role", JSON.stringify(userRoleData)); // ✅ persist

      sessionRef.current = { token: idToken, ...userRoleData };

      startTokenRefresh(firebaseUser);

      onLogin({
        email,
        role: data.user.role,
        uid: data.user.uid,
        name: cleanedFirstName,
        getToken: () => sessionRef.current.token,
        logout: handleLogout,
      });

      setMessage("Login successful! Redirecting...");
      setOpenSnackbar(true);
      setTimeout(() => navigate("/cms"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
      setOpenSnackbar(true);
    }

    setLoading(false);
  };


  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="brand-icon">
          <img
            src="/logos/hindicomics.jpg"
            alt="HindiComics Logo"
            style={{ width: "100%", height: "100%", borderRadius: "100%", objectFit: "cover" }}
          />
        </div>

        <h1 className="text-center text-3xl font-extrabold mb-1">Hindi Comics CMS</h1>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Email Address
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </label>

          <label className="block text-sm font-medium mt-4">
            Password
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </label>

          <button
            type="submit"
            className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Please wait..." : <><LogIn className="w-5 h-5" /> Sign In</>}
          </button>
        </form>

        <div className="secure-text mt-6 text-center">
          <Lock className="inline w-4 h-4 mr-2" /> Secure Access Enabled
        </div>

        {openSnackbar && <p className="text-center mt-4 text-sm text-red-300">{message}</p>}
      </div>
    </div>
  );
}
