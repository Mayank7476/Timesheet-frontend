import { useState,useEffect } from "react";
import "./06Projects.css"
import"./popup.css"
import Loader from "../component/loader";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

const Projects = () => {
const [group, setGroup] = useState([]);
const [projectCode, setProjectCode] = useState("");
const [projectName, setProjectName] = useState("");
const [projectGroup, setProjectGroup] = useState("");
const [status,setStatus] =useState(false);
const [projects,setProjects]=useState([]);
const [newPopup, setnewPopup] = useState(false);
const [editPopup, seteditPopup] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [loading,setLoading]=useState(true);


  // 🔹 Fetch groups from backend
 const token = localStorage.getItem("token");

const fetchProjects = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/project/find`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setProjects(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};
   

  const addProject = async (e) => {
  e.preventDefault();
    setLoading(true);
  try {
    // 🔥 Find selected group object
    const selectedGroup = group.find(
      (g) => g._id === projectGroup
    );

    if (!selectedGroup) {
      alert("Please select a valid group");
      return;
    }

    // 🔥 Concatenate groupName + projectName
    

    const response = await fetch(
      `${BASE_URL}/api/project/addProject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectCode: projectCode,
          projectName: projectName,
          projectGroup: [projectGroup], // ✅ correct group id
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setProjectCode("");
  setProjectName("");
  setProjectGroup("");
  setnewPopup(false);
  fetchProjects();
    } else {
      alert(data.message || "Failed to add project");
    }

  } catch (error) {
    console.error(error);
    alert("Something went wrong ❌");
  }
  finally{
    setLoading(false);
  }
};

  const fetchGroup=async()=>{
    try{
      const res=await fetch(`${BASE_URL}/api/group/getGroup`,{
        headers:{
          Authorization:`Bearer ${token}`,
        },
      }
    );
    const data=await res.json();
    const activeGroups = data.filter(g => g.blocked !== "yes");
    setGroup(activeGroups);
    }catch{
    alert("Failed to Load the groups");
  }
  };

  // 🔹 Call API when component loads
  useEffect(() => {
    fetchProjects();
    fetchGroup();
    setLoading(false);
  }, []);

 const handleEdit = (project) => {
    setSelectedProject(project);
    setProjectCode(project.projectCode);
    setProjectName(project.projectName);
    setProjectGroup(project.projectGroup?.[0]?._id || "");
    setStatus(project.status === "open" ? true : false);
    seteditPopup(true);
  };

  const updateProject = async (e) => {
  e.preventDefault();
    setLoading(true);
  try {
    const response = await fetch(
      `${BASE_URL}/api/project/updateProject/${selectedProject._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectCode,
          projectName,
          projectGroup: [projectGroup],
          status:status?"open":"closed",
        }),
      }
      
    );

    const data = await response.json();

    if (response.ok) {
      seteditPopup(false);
      fetchProjects();
       // quick refresh (simple way)
    } else {
      alert(data.message || "Update failed");
    }

  } catch (error) {
    console.error(error);
    alert("Something went wrong ❌");
  }
  finally{
    setLoading(false);
  }
};
if(loading) return <Loader/>;
  return (
    <>
    <div className="project-bodies">
      <h2 className="page-title">Project</h2>
      <table >
        <thead>
        <tr>
          <th>Project Code</th>
          <th>Project Name</th>
          <th>Group Name</th>
          <th>Status</th>
          <th>Edit</th>
        </tr>
        </thead>
        <tbody>

    {projects.map((ts) => (
      <tr key={ts._id}>
        <td>{ts.projectCode}</td>
        <td>{ts.projectName}</td>
        <td>{ts.projectGroup?.[0]?.groupName || "N/A"}</td>   
       <td>{ts.status === "open" ? "open" : "closed"}</td>
        <td><button className="pencil-button" onClick={() => handleEdit(ts)}>✏️</button> </td>
      </tr>
    ))}

        </tbody>

      </table>
      <div id="new-button">
    <button 
  className="new-button"
  onClick={() => {
    setSelectedProject(null);
    setProjectCode("");
    setProjectName("");
    setProjectGroup("");
    setStatus(false);
    setnewPopup(true);
  }}                         >New</button> </div>
    </div>


    {newPopup && (
    <div className="modal-overlay">
    <div className="modal-content">
    <div className="title-cross">
      <h3>Project</h3>
      <button type="button" onClick={() => setnewPopup(false)}>
            ❌
          </button>
    </div>

      <form className="project-form" onSubmit={addProject}>
        <label>Project Code</label>
        <input
          type="text"
          minLength={8}
          maxLength={8}
          required
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
        />

        <label>Project Name</label>
        <input
          type="text"
          required
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <label>Project Group</label>
        <select className="modal-content-dropdown"
          required
          value={projectGroup}
          onChange={(e) => setProjectGroup(e.target.value)}
        >
          <option value="">-- Select Group --</option>
          {group.map((g) => (
            <option key={g._id} value={g._id}>
              {g.groupName}
            </option>
          ))}
        </select>

        <button type="submit" className="Project-Submit">
          Add project
        </button>

        </form>
    </div>
  </div>
)}

{editPopup && (
  <div className="modal-overlay">
    <div className="modal-content">

            <div className="title-cross">
      <h3 className="modal-title">Edit Project</h3>
      <button type="button" onClick={() => seteditPopup(false)}>
            ❌
          </button>
        </div>
      

      <form className="project-form" onSubmit={updateProject}>
        <label>Project Code</label>
        <input
          type="text"
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value)}
          required
        />

        <label>Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />

        <label>Project Group</label>
        <select className="modal-content-dropdown"
          value={projectGroup}
          onChange={(e) => setProjectGroup(e.target.value)}
          required
        >
          <option value="">-- Select Group --</option>
          {group.map((g) => (
            <option key={g._id} value={g._id}>
              {g.groupName}
            </option>
          ))}
        </select>

        <label>status</label>
           <label className="switch">
            <input
            type="checkbox"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
            />
            <span className="slider"></span>
          </label>

        <button type="submit" className="Project-Submit">
          Update
        </button>
      
      
     
      </form>
    </div>
  </div>
)}

    </>
  )
}

export default Projects

