import React from 'react'
import {useState,useEffect} from "react";
import "./08Employee.css"
import"./popup.css"
import Loader from '../component/loader';
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

const AllEmployee = () => {
    const [users,setUsers]=useState([]);
    const [editPopUp,seteditPopUp]=useState(false); 
    const [selectedUser,setselectedUser]=useState("")
    const [empCode,setEmpCode]=useState("");
    const [empName,setEmpName]=useState("");
    const [empEmail,setEmpEmail]=useState("");
    const [empRole,setEmpRole]=useState("");
    const [newPopUp, setNewPopUp] = useState(false);
    const [password,setPassword]=useState("");
    const [joiningDate,setJoiningDate]=useState("");
    const [loading,setLoading]=useState(true);

    const token = localStorage.getItem("token");
    const fetchAlluser = async(e)=>{
        setLoading(true);
        try{
            const res=await fetch(`${BASE_URL}/api/user/getAllUser`,{
                headers:{Authorization:`Bearer ${token}`},
            });
            const data=await res.json();
            setUsers(data.user);

        }
        catch(error){
            alert("Server Error");
        }
        finally{
          setLoading(false);
        }
    };
    useEffect(()=>{
    fetchAlluser();
    },[]);


    const openEditPopup = (user) =>{
    setselectedUser(user);
    setEmpCode(user.id);
    setEmpName(user.name);
    setEmpEmail(user.email);
    setEmpRole(user.role);
    seteditPopUp(true);
}

const updateEmployee = async (e)=>{
    e.preventDefault();
    setLoading(true);
    try{
        const res = await fetch(
            `${BASE_URL}/api/user/updateUser/${selectedUser._id}`,
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body:JSON.stringify({
                    id:empCode,
                    name:empName,
                    email:empEmail,
                    role:empRole
                })
            }
        );

        const data = await res.json();

        if(res.ok){
            fetchAlluser();
            seteditPopUp(false);
            setselectedUser(null);
        }
        else{
            alert(data.message || "Update failed");
        }

    }
    catch(error){
        console.error(error);
        alert("Server Error");
    }
    finally{
      setLoading(false);
    }
};


const addEmployee = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch(
      `${BASE_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: empCode,
          name: empName,
          email: empEmail,
          password:password,
          role: empRole,
          DOJ: joiningDate,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      fetchAlluser();
      setNewPopUp(false);
    } else {
      alert(data.message || "Creation failed");
    }
  } catch (error) {
    console.error(error);
    alert("Server Error");
  }
  finally{
    setLoading(false);
  }
};
   
 if(loading) return <Loader/>;
    return (
  <div className="employee-container">
    <h2 className="page-title">Employees</h2>
    <table className="employee-table">
      <thead className="employee-thead">
        <tr>
          <th>Employee Code</th>
          <th>Employee Name</th>
          <th>Employee Email</th>
          <th>Role</th>
          <th>Edit</th>
        </tr>
      </thead>

      <tbody className="employee-tbody">
        {users.map((ts) => (
          <tr key={ts._id} className="employee-row">
            <td className="employee-cell">{ts.id}</td>
            <td className="employee-cell">{ts.name}</td>
            <td className="employee-cell">{ts.email}</td>
            <td className="employee-cell">{ts.role}</td>
            <td className="employee-cell">
              <button className="pencil-button"  onClick={() => openEditPopup(ts)}  >✏️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="new-button-div"> 
    <button
  className="new-button"
  onClick={() => {
    setEmpCode("");
    setEmpName("");
    setEmpEmail("");
    setPassword("");
    setEmpRole("user");
    setJoiningDate("");
       // important
    setNewPopUp(true);       // open NEW popup
  }}
>
  New
</button>
 </div>

      {/* new pop up */}
 
 
  {newPopUp && (
  <div className="modal-overlay">
    <div className="modal-content">

      <div className="title-cross">
        <h3>Add Employee</h3>
        <button onClick={() => setNewPopUp(false)}>❌</button>
      </div>

      <form onSubmit={addEmployee}>
        <label>Employee Code</label>
        <input
          type="text"
          value={empCode}
          onChange={(e) => setEmpCode(e.target.value)}
          required
        />

        <label>Employee Name</label>
        <input
          type="text"
          value={empName}
          onChange={(e) => setEmpName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={empEmail}
          onChange={(e) => setEmpEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Role</label>
        <select className="modal-content-dropdown"
          value={empRole}
          onChange={(e) => setEmpRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <label>Date Of Joining</label>
        <input
          type="date"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
          required
        />

        <div className="modal-buttons">
          <button className="new-button" type="submit">
            Add
          </button>
        </div>
      </form>

    </div>
  </div>
)}






    {editPopUp && (
        <div className="modal-overlay">
        <div className="modal-content">

        
      <div className='cross-btn-div' >
        <h3>Update Employee</h3>
        <button onClick={()=>seteditPopUp(false)}>❌</button>
       </div>

        <form className="edituserform" onSubmit={updateEmployee}>

        <label>Employee Code</label>
        <input
        type="text"
        value={empCode}
        onChange={(e)=>setEmpCode(e.target.value)}
        required/>

        <label>Employee Name</label>
        <input
        type="text"
        value={empName}
        onChange={(e)=>setEmpName(e.target.value)}
        required/>

        <label>Email</label>
        <input
        type="email"
        value={empEmail}
        onChange={(e)=>setEmpEmail(e.target.value)}
        required/>

        <label>Role</label>
        <select className='modal-content-dropdown'
        value={empRole}
        onChange={(e)=>setEmpRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        </select>

        <div className="modal-buttons">
        <button className="new-button" type="submit">Update</button>
        </div>

    </form>
    </div>
</div>
)}



 </div>
);
  
}

export default AllEmployee
