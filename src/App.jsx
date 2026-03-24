
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./App.css";

import Header from "./component/Header";

import Navbar from "./component/Navbar";
import Login from "./pages/login";
import TimeSheet from "./pages/01timesheet";
import PendingVerification from "./pages/02pending-verfication";
import TimesheetHistory from "./pages/03timesheet-history";
import LeaveHistory from "./pages/04leave-history";
import ProjectAssignment from "./pages/05project-assignment";
import Projects from "./pages/06Projects"
import ProjectGroup from "./pages/07ProjectGroup";
import AllEmployee from "./pages/08Employee";
import Report from "./pages/09Report";
import SSOSuccess from "./pages/ssoSuccess";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {setLoading(false);return;}

    try {
      const decoded = jwtDecode(token);

      // exp is in seconds
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();

      if (expiryTime < currentTime) {
        logout();
      } else {
        setUserRole(decoded.role);
        // Auto logout when token expires
        const timeout = expiryTime - currentTime;
        setTimeout(() => {
          logout();
        }, timeout);
      }
    } catch (error) {
      logout();
    }
    finally {
    setLoading(false); // ✅ IMPORTANT
  }
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    setIsAuthenticated(false);
        window.location.href = "/login"; // force redirect
  };
  

  if (loading) return <div>Loading...</div>; 
    return (
    <div className="layout">
      {isAuthenticated && <Header handleLogout={logout} />}
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated}
    userRole={userRole}
    isSidebarOpen={isSidebarOpen}
    setIsSidebarOpen={setIsSidebarOpen} />}

     <div
  className={`page-content 
    ${isAuthenticated ? "with-header" : "full-page"}
    ${isSidebarOpen ? "shifted" : "centered"}`
    }
>
      <Routes>
        
        <Route
          path="/login"
          element={
            isAuthenticated ? (<Navigate to="/timesheet" replace />) : (<Login setIsAuthenticated={setIsAuthenticated} />)
          }
        />

        <Route
  path="/sso-success"
  element={
    <SSOSuccess setIsAuthenticated={setIsAuthenticated} />
  }
/>

        <Route
          path="/timesheet"
          element={
            isAuthenticated ? <TimeSheet /> : <Navigate to="/login"  />
          }
        />
        <Route 
          path="/pending-verification" 
          element={
            isAuthenticated? <PendingVerification /> : <Navigate to="/login" />
            }/>
        <Route path="/timesheet-history" 
          element={isAuthenticated? <TimesheetHistory /> : <Navigate to="/login"  />
        }/>
        <Route path="/leave-history" 
          element={isAuthenticated?<LeaveHistory />:<Navigate to="/login"   />
          } />
        <Route path="/project-assignment" 
          element={isAuthenticated?<ProjectAssignment />:<Navigate to="/login"  />
        } />
        <Route path="/admin/project" 
          element={isAuthenticated&& userRole === "admin"?<Projects />:<Navigate to="/login"  />
        } />


        <Route path="/admin/group" 
          element={isAuthenticated && userRole === "admin"?<ProjectGroup />:<Navigate to="/login"  />
        } />

        <Route path="/admin/employee" 
          element={isAuthenticated && userRole === "admin"?<AllEmployee />:<Navigate to="/login"  />
        } />

        <Route path="/admin/report" 
          element={isAuthenticated && userRole === "admin"?<Report />:<Navigate to="/login"  />
        } />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      </div>
    </div>
    
  );
}

export default App;

