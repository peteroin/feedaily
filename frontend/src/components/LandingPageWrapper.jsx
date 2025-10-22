import LandingPage from "./LandingPage";
import { useNavigate } from "react-router-dom";


// Wrapper for LandingPage (to use navigation)
function LandingPageWrapper() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  const goToLogin = () => navigate("/login");
  const goToGetStarted = () => {
    if (isLoggedIn) navigate("/dashboard");
    else navigate("/register");
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <LandingPage
      isLoggedIn={isLoggedIn}
      onLoginClick={goToLogin}
      onLogoutClick={handleLogout}
      onGetStartedClick={goToGetStarted}
    />
  );
}

export default LandingPageWrapper;