import "./Header.css";
import myImage from "../assets/think-gas-login.png"
const Header = ({ handleLogout }) => {
 
  return (
    <div className="header">
      <img src={myImage} alt="Logo" className="header-logo" />
      

      <button className="header-logout" onClick={handleLogout}>
        ➜] Logout
      </button>
    </div>
  );
};

export default Header;