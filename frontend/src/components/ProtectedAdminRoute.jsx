import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  useEffect(() => {
    if (!adminUser) {
      navigate("/admin-login");
    }
  }, [navigate, adminUser]);

  if (!adminUser) {
    return <div>Redirecting to admin login...</div>;
  }

  return children;
}

export default ProtectedAdminRoute;
