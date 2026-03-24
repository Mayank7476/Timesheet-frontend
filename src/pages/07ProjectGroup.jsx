  import { useState,useEffect } from "react";
  import "./07projectgroup.css"
  import"./popup.css"
  const BASE_URL=import.meta.env.VITE_API_BASE_URL;

  const ProjectGroup = () => {
    const[group,setGroup]=useState([]);
    const[GroupCode,setGroupcode]=useState("");
    const[GroupName,setGroupName]=useState("");
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const[blocked,setBlocked]=useState(false);

    const token = localStorage.getItem("token");
    const fetchgroup=async()=>{ 
      try{
        const res=await fetch(`${BASE_URL}/api/group/getGroup`,{
          headers:{
            Authorization:`Bearer ${token}`,
          },
        }
      );
      const data=await res.json();
      setGroup(data);
      }catch{
      alert("Failed to Load the groups");
    }
    };
    useEffect(()=>{
        fetchgroup();
    },[]
  );
    
  const submitGroup=async (e) => {
    e.preventDefault();
    try{
      const res=await fetch(
        `${BASE_URL}/api/group/addGroup`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({
          groupId:GroupCode,
          groupName:GroupName
        }),
      });
      const data=await res.json();
      if(res.ok){
        setGroupName("");
        setGroupcode("");
        fetchgroup();
        setShowModal(false);
      }
      else {
        alert(data.message || "Failed to add project");
      }

    } catch (error){
      console.error(error);
      alert("Something went wrong");
    }
  };

  const openEditModal = (group) => {
  setSelectedGroup(group);
  setGroupcode(group.groupId);
  setGroupName(group.groupName);
  setBlocked(group.blocked === "yes")
  setShowEditModal(true);
};

const updateGroup = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(
      `${BASE_URL}/api/group/updateGrpById/${selectedGroup._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId: GroupCode,
          groupName: GroupName,
            blocked: blocked ? "yes" : "no" ,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setGroupName("");
        setGroupcode("");
        fetchgroup();
        setShowModal(false);
      fetchgroup();
      setShowEditModal(false);
      setSelectedGroup(null);
    } else {
      alert(data.message || "Failed to update group");
    }
  } catch (error) {
    console.error(error);
    alert("Update failed");
  }
};

    
    
    
      return (
        <>
      <div className="projectgroup-bodies" >
        <h2 className="page-title">Project-Group</h2>
        <table>
          <thead><tr>
              <th>Group Code</th>
              <th>Group Name</th>
              <th>Blocked</th>
              <th>Edit</th>
              </tr>
        </thead>
        
          <tbody>
    {group.map((ts) => (
      <tr key={ts._id}>
        <td>{ts.groupId}</td>
        <td>{ts.groupName}</td>
       <td>{ts.blocked === "yes" ? "yes" : "no"}</td>
        <td><button className="pencil-button" onClick={() => openEditModal(ts)}>✏️</button> </td>
      </tr>
    ))}
  </tbody>
  </table>

    <div className="new-button-div"> 
    <button className="new-button"  onClick={() => {
    setGroupcode("");
    setGroupName("");
    setBlocked(false);
    setSelectedGroup(null);
    setShowModal(true);   }}>
    New
    </button> </div>


    </div>




      {/* new pop up */}
    {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="title-cross">
      <h3>Add Project Group</h3>
      <button type="button" onClick={() => setShowModal(false)}>
            ❌
          </button>
        </div>
      <form onSubmit={submitGroup}>
        <label>Group Code</label>
        <input
          type="text"
          minLength={4}
          maxLength={8}
          required
          value={GroupCode}
          onChange={(e) => setGroupcode(e.target.value)}
        />

        <label>Group Name</label>
        <input
          type="text"
          required
          value={GroupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="new-button" type="submit">Add</button>
          
        </div>
      </form>
    </div>
  </div>
)} 

{/* edit pop up */}
{showEditModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="title-cross">
      <h3>update Project Group</h3>
      <button type="button" onClick={() => setShowEditModal(false)}>
            ❌
          </button>
        </div>

      <form onSubmit={updateGroup}>
        <label>Group Code</label>
        <input
          type="text"
          minLength={4}
          maxLength={8}
          value={GroupCode}
          onChange={(e) => setGroupcode(e.target.value)}
          required
        />

        <label>Group Name</label>
        <input
          type="text"
          value={GroupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
          <label>Blocked</label>
           <label className="switch">
            <input
            type="checkbox"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
          <div className="modal-buttons">
          <button className="new-button" type="submit">Update</button>
         
        </div>
      </form>
    </div>
  </div>
)}


  </>

    )
  }

  export default ProjectGroup;
