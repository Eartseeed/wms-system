import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API } from "../config/api";

function UserManagement() {

  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("employee");

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  /* =========================
     LOAD USER
  ========================= */

  const loadUsers = useCallback(async () => {

  try {

    const res = await axios.get(

      `${API}/users`,

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );

    setUsers(res.data.data || []);

  } catch (err) {

    console.log(err);

    alert(

      err.response?.data?.message ||

      "Load User Failed"

    );

  }

}, [token]);

  /* =========================
     ADD USER
  ========================= */

  const addUser = async () => {

    if (!username.trim()) {

      alert("Username Required");

      return;

    }

    if (!password.trim()) {

      alert("Password Required");

      return;

    }

    try {

      setLoading(true);

      await axios.post(

        `${API}/users`,

        {

          username,
          password,
          fullname,
          role

        },

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      alert("Create User Success");

      clearForm();

      loadUsers();

    } catch (err) {

      alert(

        err.response?.data?.message ||

        "Create User Failed"

      );

    } finally {

      setLoading(false);

    }

  };

  /* =========================
     EDIT USER
  ========================= */

  const editUser = (user) => {

    setEditingId(user.id);

    setUsername(user.username);

    setPassword("");

    setFullname(user.fullname || "");

    setRole(user.role);

  };

  /* =========================
     UPDATE USER
  ========================= */

  const updateUser = async () => {

    try {

      setLoading(true);

      await axios.put(

        `${API}/users/${editingId}`,

        {

          fullname,
          role

        },

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      alert("Update Success");

      clearForm();

      loadUsers();

    } catch (err) {

      alert(

        err.response?.data?.message ||

        "Update Failed"

      );

    } finally {

      setLoading(false);

    }

  };

  /* =========================
     DELETE USER
  ========================= */

  const deleteUser = async (id) => {

    if (!window.confirm("Delete User ?")) {

      return;

    }

    try {

      await axios.delete(

        `${API}/users/${id}`,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      alert("Delete Success");

      loadUsers();

    } catch (err) {

      alert(

        err.response?.data?.message ||

        "Delete Failed"

      );

    }

  };
/* =========================
RESET PASSWORD
========================= */

const resetPassword = async (id) => {

  const password = window.prompt(

    "New Password"

  );

  if (!password) return;

  try {

    await axios.put(

      `${API}/users/${id}/password`,

      {

        password

      },

      {

        headers:{

          Authorization:`Bearer ${token}`

        }

      }

    );

    alert("Reset Password Success");

  } catch(err){

    alert(

      err.response?.data?.message ||

      "Reset Password Failed"

    );

  }

};
  /* =========================
     CLEAR FORM
  ========================= */

  const clearForm = () => {

    setEditingId(null);

    setUsername("");

    setPassword("");

    setFullname("");

    setRole("employee");

  };

  useEffect(() => {

  loadUsers();

}, [loadUsers]);
const filteredUsers = users.filter((u) => {

  const keyword = search.toLowerCase();

  return (

    u.username?.toLowerCase().includes(keyword) ||

    u.fullname?.toLowerCase().includes(keyword) ||

    u.role?.toLowerCase().includes(keyword)

  );

});
    return (

    <div style={{ padding: 20 }}>

      <h2>User Management</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 20,
          marginBottom: 20
        }}
      >

        <h3>

          {editingId ? "Edit User" : "Add User"}

        </h3>

        <input

          placeholder="Username"

          value={username}

          disabled={editingId !== null}

          onChange={(e)=>setUsername(e.target.value)}

          style={{

            width:"100%",
            padding:10,
            marginBottom:10

          }}

        />

        {

          editingId === null && (

            <input

              type="password"

              placeholder="Password"

              value={password}

              onChange={(e)=>setPassword(e.target.value)}

              style={{

                width:"100%",
                padding:10,
                marginBottom:10

              }}

            />

          )

        }

        <input

          placeholder="Full Name"

          value={fullname}

          onChange={(e)=>setFullname(e.target.value)}

          style={{

            width:"100%",
            padding:10,
            marginBottom:10

          }}

        />

        <select

          value={role}

          onChange={(e)=>setRole(e.target.value)}

          style={{

            width:"100%",
            padding:10,
            marginBottom:15

          }}

        >

          <option value="employee">

            Employee

          </option>

          <option value="admin">

            Admin

          </option>

        </select>

        <button

          onClick={

            editingId

              ? updateUser

              : addUser

          }

          disabled={loading}

        >

          {

            loading

              ? "Saving..."

              : editingId

              ? "Update User"

              : "Save User"

          }

        </button>

        {

          editingId && (

            <button

              style={{ marginLeft:10 }}

              onClick={clearForm}

            >

              Cancel

            </button>

          )

        }

      </div>
<div

  style={{

    marginBottom:15

  }}

>

  <input

    placeholder="Search Username / Full Name / Role"

    value={search}

    onChange={(e)=>

      setSearch(e.target.value)

    }

    style={{

      width:"100%",

      padding:10

    }}

  />

</div>
      <table

        border="1"

        cellPadding="10"

        width="100%"

      >

        <thead>

          <tr>

            <th>ID</th>
            <th>Username</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Create Date</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {

            filteredUsers.map((u)=>(

              <tr key={u.id}>

                <td>{u.id}</td>

                <td>{u.username}</td>

                <td>{u.fullname}</td>

                <td>{u.role}</td>

                <td>{u.created_at}</td>

                <td>

  <button

    onClick={()=>editUser(u)}

  >

    Edit

  </button>

  {" "}

  <button

    onClick={()=>resetPassword(u.id)}

  >

    Reset Password

  </button>

  {

    u.username !== "admin" && (

      <>

        {" "}

        <button

          onClick={()=>deleteUser(u.id)}

        >

          Delete

        </button>

      </>

    )

  }

</td>
              </tr>

            ))

          }

        </tbody>

      </table>

    </div>

  );

}

export default UserManagement;