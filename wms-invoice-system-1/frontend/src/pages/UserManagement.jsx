import {
  useEffect,
  useState,
  useCallback
} from "react";

import {
  API
} from "../config/api";


const ROLE_OPTIONS = [

  {
    value: "ADMIN",
    label: "Admin"
  },

  {
    value: "SUPERVISOR",
    label: "Supervisor"
  },

  {
    value: "EMPLOYEE",
    label: "Employee"
  }

];


const normalizeRole =
  (role) => {

    const value =
      String(
        role || "EMPLOYEE"
      )
        .trim()
        .toUpperCase();


    if (
      value === "ADMIN"
    ) {

      return "ADMIN";

    }


    if (
      value === "SUPERVISOR"
    ) {

      return "SUPERVISOR";

    }


    return "EMPLOYEE";

  };


const formatDate =
  (value) => {

    if (
      !value
    ) {

      return "-";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return date.toLocaleString();

  };


function UserManagement() {


  const token =
    localStorage.getItem(
      "token"
    );


  const [list, setList] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({

      username: "",

      password: "",

      fullname: "",

      role: "EMPLOYEE"

    });


  const getHeaders =
  useCallback(
    (
      json = false
    ) => {

      const headers =
        {};


      if (
        token
      ) {

        headers.Authorization =
          `Bearer ${token}`;

      }


      if (
        json
      ) {

        headers[
          "Content-Type"
        ] =
          "application/json";

      }


      return headers;

    },
    [token]
  );

  const loadData =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );


          const res =
            await fetch(
              `${API}/users`,
              {

                method:
                  "GET",

                headers:
                  getHeaders()

              }
            );


          const result =
            await res.json();


          if (
            !res.ok ||
            result.success === false
          ) {

            throw new Error(
              result.message ||
              "Load User failed"
            );

          }


          setList(
            Array.isArray(
              result.data
            )
              ? result.data
              : []
          );


        } catch (
          err
        ) {

          console.error(
            "Load User error:",
            err
          );


          alert(
            "ໂຫຼດຂໍ້ມູນ User ບໍ່ສຳເລັດ: " +
            err.message
          );


          setList(
            []
          );


        } finally {

          setLoading(
            false
          );

        }

      },
            [getHeaders]
    );


  useEffect(
    () => {

      loadData();

    },
    [loadData]
  );


  const resetForm =
    () => {

      setEditId(
        null
      );


      setForm({

        username: "",

        password: "",

        fullname: "",

        role: "EMPLOYEE"

      });

    };


  const saveUser =
    async () => {

      try {

        const username =
          String(
            form.username || ""
          )
            .trim();


        const password =
          String(
            form.password || ""
          );


        const fullname =
          String(
            form.fullname || ""
          )
            .trim();


        const role =
          normalizeRole(
            form.role
          );


        if (
          !username
        ) {

          alert(
            "ກະລຸນາໃສ່ Username"
          );

          return;

        }


        if (
          !editId &&
          !password
        ) {

          alert(
            "ກະລຸນາໃສ່ Password"
          );

          return;

        }


        if (
          !fullname
        ) {

          alert(
            "ກະລຸນາໃສ່ Full Name"
          );

          return;

        }


        setLoading(
          true
        );


        const payload =
          {

            username,

            fullname,

            role

          };


        if (
          password
        ) {

          payload.password =
            password;

        }


        const url =
          editId
            ? `${API}/users/${editId}`
            : `${API}/users`;


        const method =
          editId
            ? "PUT"
            : "POST";


        const res =
          await fetch(
            url,
            {

              method,

              headers:
                getHeaders(
                  true
                ),

              body:
                JSON.stringify(
                  payload
                )

            }
          );


        const result =
          await res.json();


        if (
          !res.ok ||
          result.success === false
        ) {

          throw new Error(
            result.message ||
            "Save failed"
          );

        }


        alert(
          editId
            ? "ແກ້ໄຂ User ສຳເລັດ"
            : "ສ້າງ User ສຳເລັດ"
        );


        resetForm();

        await loadData();


      } catch (
        err
      ) {

        console.error(
          "Save User error:",
          err
        );


        alert(
          "ບັນທຶກບໍ່ສຳເລັດ: " +
          err.message
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  const editUser =
    (
      item
    ) => {

      setEditId(
        item.id
      );


      setForm({

        username:
          item.username || "",

        password:
          "",

        fullname:
          item.fullname ||
          item.full_name ||
          "",

        role:
          normalizeRole(
            item.role
          )

      });


      window.scrollTo({

        top: 0,

        behavior:
          "smooth"

      });

    };


  const changeRole =
    async (
      item,
      role
    ) => {

      try {

        const newRole =
          normalizeRole(
            role
          );


        setLoading(
          true
        );


        const res =
          await fetch(
            `${API}/users/${item.id}`,
            {

              method:
                "PUT",

              headers:
                getHeaders(
                  true
                ),

              body:
                JSON.stringify({

                  username:
                    item.username,

                  fullname:
                    item.fullname ||
                    item.full_name ||
                    "",

                  role:
                    newRole

                })

            }
          );


        const result =
          await res.json();


        if (
          !res.ok ||
          result.success === false
        ) {

          throw new Error(
            result.message ||
            "Change Role failed"
          );

        }


        await loadData();


      } catch (
        err
      ) {

        alert(
          "ປ່ຽນ Role ບໍ່ສຳເລັດ: " +
          err.message
        );


        await loadData();


      } finally {

        setLoading(
          false
        );

      }

    };


  const deleteUser =
    async (
      id
    ) => {

      if (
        !window.confirm(
          "ຢືນຢັນການລົບ User?"
        )
      ) {

        return;

      }


      try {

        setLoading(
          true
        );


        const res =
          await fetch(
            `${API}/users/${id}`,
            {

              method:
                "DELETE",

              headers:
                getHeaders()

            }
          );


        const result =
          await res.json();


        if (
          !res.ok ||
          result.success === false
        ) {

          throw new Error(
            result.message ||
            "Delete failed"
          );

        }


        if (
          String(
            editId
          ) ===
          String(
            id
          )
        ) {

          resetForm();

        }


        await loadData();


      } catch (
        err
      ) {

        alert(
          "ລົບ User ບໍ່ສຳເລັດ: " +
          err.message
        );


      } finally {

        setLoading(
          false
        );

      }

    };


  const keyword =
    search
      .trim()
      .toLowerCase();


  const filtered =
    keyword === ""

      ? list

      : list.filter(
          (
            item
          ) => {

            const fields =
              [

                item.username,

                item.fullname,

                item.full_name,

                item.role

              ];


            return fields.some(
              (
                value
              ) =>

                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(
                    keyword
                  )

            );

          }
        );


  return (

    <div className="page">

      <h1>
        👤 User Management
      </h1>


      <div className="card">

        <h3>
          {editId
            ? "✏️ Edit User"
            : "👤 Add User"}
        </h3>


        <input
          placeholder="Username"
          value={
            form.username
          }
          disabled={
            Boolean(
              editId
            )
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                username:
                  e.target.value

              })
            )
          }
        />


        <input
          type="password"
          placeholder={
            editId
              ? "Password (ປ່ອຍວ່າງ = ບໍ່ປ່ຽນ)"
              : "Password"
          }
          value={
            form.password
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                password:
                  e.target.value

              })
            )
          }
        />


        <input
          placeholder="Full Name"
          value={
            form.fullname
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                fullname:
                  e.target.value

              })
            )
          }
        />


        <select
          value={
            form.role
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                role:
                  normalizeRole(
                    e.target.value
                  )

              })
            )
          }
        >

          {ROLE_OPTIONS.map(
            (
              item
            ) => (

              <option
                key={
                  item.value
                }
                value={
                  item.value
                }
              >

                {item.label}

              </option>

            )
          )}

        </select>


        <button
          type="button"
          onClick={
            saveUser
          }
          disabled={
            loading
          }
        >

          {editId
            ? "💾 Update User"
            : "💾 Save User"}

        </button>


        {editId && (

          <button
            type="button"
            onClick={
              resetForm
            }
            style={{

              marginLeft:
                "10px"

            }}
          >

            ❌ Cancel

          </button>

        )}

      </div>


      <div className="card">

        <input
          placeholder="🔍 Search Username / Full Name / Role"
          value={
            search
          }
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      <div className="card">

        <table
          border="1"
          width="100%"
          cellPadding="10"
        >

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Username
              </th>

              <th>
                Full Name
              </th>

              <th>
                Role
              </th>

              <th>
                Create Date
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {loading &&
              list.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    align="center"
                  >

                    Loading...

                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    align="center"
                  >

                    ບໍ່ພົບຂໍ້ມູນ User

                  </td>

                </tr>

              ) : (

                filtered.map(
                  (
                    item
                  ) => (

                    <tr
                      key={
                        item.id
                      }
                    >

                      <td>
                        {item.id}
                      </td>

                      <td>
                        {item.username}
                      </td>

                      <td>
                        {
                          item.fullname ||
                          item.full_name ||
                          "-"
                        }
                      </td>

                      <td>

                        <select
                          value={
                            normalizeRole(
                              item.role
                            )
                          }
                          onChange={(e) =>
                            changeRole(
                              item,
                              e.target.value
                            )
                          }
                        >

                          {ROLE_OPTIONS.map(
                            (
                              roleItem
                            ) => (

                              <option
                                key={
                                  roleItem.value
                                }
                                value={
                                  roleItem.value
                                }
                              >

                                {roleItem.label}

                              </option>

                            )
                          )}

                        </select>

                      </td>

                      <td>

                        {formatDate(
                          item.created_at ||
                          item.createdAt
                        )}

                      </td>

                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            editUser(
                              item
                            )
                          }
                        >

                          ✏️ Edit

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            deleteUser(
                              item.id
                            )
                          }
                          style={{

                            marginLeft:
                              "8px"

                          }}
                        >

                          🗑 Delete

                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

          </tbody>

        </table>

      </div>

    </div>

  );

}


export default UserManagement;