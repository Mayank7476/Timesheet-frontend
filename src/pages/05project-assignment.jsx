import { useEffect, useState } from "react";
import "./05project-assignment.css";
import {autoAlert} from "../utility";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;


const ProjectAssignment = () => {
  const [projects, setProjects] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [checkedProjects, setCheckedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeecode, setEmployeecode] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeerole, setEmployeerole] = useState("");

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${BASE_URL}/api/project/find`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, [token]);
  useEffect(() => {
  fetch(`${BASE_URL}/api/assignment/getAssign`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      setAssignedProjects(data.assignedProjects);
      setEmployeeName(data.name);
      setEmployeecode(data.code);
      setEmployeeEmail(data.email);
      setEmployeerole(data.role);
    });
}, [token]);

const unassignedProjects = projects.filter(
  (project) =>
    !assignedProjects.some(
      (assigned) => assigned._id === project._id
    )
);

  if (loading) return <p className="loading">Loading projects...</p>;



const toggleProjectSelect = (projectId) => {
  setSelectedProject((prev) =>
    prev.includes(projectId)
      ? prev.filter((id) => id !== projectId)
      : [...prev, projectId]
  );
};

 const handleAssignProject = async () => {
  if (selectedProject.length === 0) {
    autoAlert("Please select at least one project");
    return;
  }

  try {
    for (const projectId of selectedProject) {
      const res = await fetch(`${BASE_URL}/api/assignment/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    }

    const newlyAssigned = projects.filter(p =>
      selectedProject.includes(p._id)
    );

    setAssignedProjects(prev => [...prev, ...newlyAssigned]);
    setSelectedProject([]);
    setShowDropdown(false);

    autoAlert("Projects assigned successfully ✅");
  } catch (err) {
    autoAlert(err.message || "Assignment failed");
  }
};


 const handleCheckboxChange = (projectId) => {
    setCheckedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };



  const handleDeassignProjects = async () => {
    if (checkedProjects.length === 0) {
      autoAlert("Please select at least one project");
      return;
    }

    try {
      for (const projectId of checkedProjects) {
        const res = await fetch(`${BASE_URL}/api/assignment/deassign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
      }
        setAssignedProjects(prev =>
      prev.filter(p => !checkedProjects.includes(p._id))
    );
      autoAlert("Selected projects removed successfully ❌");
      setCheckedProjects([]);
    } catch (err) {
      autoAlert(err.message);
      setCheckedProjects([]);
    }
  };



  return (
    <div className="project-page">
      <h2 className="page-title">Project Assignment</h2>

      {/* Employee Info */}
     <div className="employee-card-theme">
  <div className="employee-item">
    <span className="emp-label">Employee Name</span>
    <span className="emp-value">{employeeName}</span>
  </div>

  <div className="employee-item">
    <span className="emp-label">Employee Code</span>
    <span className="emp-value">{employeecode}</span>
  </div>

  <div className="employee-item">
    <span className="emp-label">Employee Email</span>
    <span className="emp-value">{employeeEmail}</span>
  </div>

  <div className="employee-item">
    <span className="emp-label">Employee Role</span>
    <span className="emp-role">{employeerole}</span>
  </div>
</div>

      {/* Assign Project */}
      <div className="assign-row">
  <div
    className="dropdown-header"
    onClick={() => setShowDropdown(!showDropdown)}
  >
    {selectedProject.length === 0
      ? "Select Project(s)"
      : `${selectedProject.length} project(s) selected`}
    <span>▾</span>
  </div>

  {showDropdown && (
    <div className="dropdown-menu">
      {unassignedProjects.length === 0 ? (
        <div className="dropdown-item">No projects available</div>
      ) : (
        unassignedProjects.map((p) => (
          <label key={p._id} className="dropdown-item">
            <input
              type="checkbox"
              checked={selectedProject.includes(p._id)}
              onChange={() => toggleProjectSelect(p._id)}
            />
            {p.projectName}
          </label>
        ))
      )}
    </div>
  )}

  <button className="primary-btn" onClick={handleAssignProject}>
    Assign
  </button>
</div>


      {/* Assigned Projects */}
      <div className="card table-card">
        <h3>Assigned Project List</h3>

        <table className="project-table">
          <thead>
            <tr>
              <th></th>
              <th>Project Code</th>
              <th>Project Name</th>
            </tr>
          </thead>
          <tbody>
            
            {assignedProjects.length === 0 ? (
    <tr>
      <td colSpan="3" style={{ textAlign: "center" }}>
        No projects assigned
      </td>
    </tr>
  ) : (assignedProjects.map((p) => (
              <tr key={p._id}>
                <td>
                  <input className="checking" type="checkbox"
                  checked={checkedProjects.includes(p._id)}
                    onChange={() => handleCheckboxChange(p._id)} />
                </td>
                <td>{p.projectCode}</td>
                <td>{p.projectName}</td>
              </tr>
            )))}
          </tbody>
        </table>
<div className="danger-btn-div"> <button className="danger-btn" onClick={handleDeassignProjects}>Remove Selected</button>
</div>
      </div>
    </div>
  );
};

export default ProjectAssignment;
