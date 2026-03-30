import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../component/loader";
import './login.css'
import { autoAlert } from "../utility";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

const LoginPage = ({setIsAuthenticated}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // 1️⃣ stop page reload

    try {
      setLoading(true);
      // 2️⃣ call backend login API
      const response = await fetch(
        `${BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // 3️⃣ handle errors
      if (!response.ok) {
        autoAlert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // 4️⃣ save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("isLoggedIn", "true");
      setIsAuthenticated(true);
      setLoading(false);
      // 5️⃣ redirect (optional)
      navigate("/timesheet",{replace:true});
    } catch (error) {
      alert("Server not reachable");
      console.error(error);
      setLoading(false);
    }
    };

const ssoLogin = (e) => {
  e.preventDefault();

  try {
    autoAlert("Redirecting to SSO...");

    // ✅ Use backend local URL (as per your setup)
    window.location.href = `${BASE_URL}/auth/saml/loginsso`;

  } catch (error) {
    console.error("SSO Login Error:", error);
  }
};








    if(loading) return <Loader/>;
  return (
    <div className="container">
    <div className="images"></div>
    <div className="loginpage">
      <form onSubmit={handleLogin}>
        <h2 > Login  </h2>

        <label>Email</label>
        <input type="email" className="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" className="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <button
          type="submit-login"
          className="login">
          Login
        </button>
        <button className="login" onClick={ssoLogin}>Login SSO</button>
      </form>
    </div>
    </div>
  );
};
export default LoginPage;