import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";


const Navbar = ({ setIsAuthenticated, userRole, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
 

 
    return (
  <div className="sidebar-wrapper">
    {/* Toggle Button */}
    

    <div className={`back ${isSidebarOpen ? "open" : "closed"}`}>
      <nav className="navbar">
        <button
      className="toggle-btn"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      ☰
    </button>
    
        {/* <div className="navbar-logo">
          <img src={MyImage} alt="logo" />
        </div> */}

      <ul className="navbar-links">
  <li>
    <NavLink to="/timesheet">
    <span className="icon">⏱</span>
    <span className="text">Timesheet </span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/pending-verification">
    <span className="icon">📝</span>
    <span className="text">Pending Verification </span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/timesheet-history">
    <span className="icon">📜</span>
    <span className="text">Timesheet History </span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/leave-history">
    <span className="icon">📅</span>
    <span className="text">Leave History </span>
    </NavLink>
  </li>
  <li>
    <NavLink to="/project-assignment">
    <span className="icon">📂</span>
    <span className="text">Project Assignment </span>
    </NavLink>
  </li>

  {userRole === "admin" && (
    <>
      <li>
        <NavLink to="/admin/project">
        <span className="icon">🛠</span>
        <span className="text">Projects </span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/group">
        <span className="icon">👥</span>
        <span className="text">ProjectGroup </span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/employee">
        <span className="icon">🧑‍💼</span>
        <span className="text">Employee </span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/report">
        <span className="icon">📊</span>
        <span className="text">Report </span>
        </NavLink>
      </li>
    </>
  )}
</ul>

      
      </nav>
    </div>
  </div>
);
};

export default Navbar;

