import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SSOSuccess = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // 2️⃣ Store token
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");

      setIsAuthenticated(true);

      // 3️⃣ Redirect to app
      navigate("/timesheet", { replace: true });
    } else {
      // fallback if no token
      navigate("/", { replace: true });
    }
  }, [navigate, setIsAuthenticated]);

  return <h2>Logging you in via SSO...</h2>;
};

export default SSOSuccess;