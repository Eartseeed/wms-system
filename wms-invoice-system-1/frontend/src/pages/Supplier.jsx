import {
  useEffect,
  useState,
  useCallback
} from "react";

import { API } from "../config/api";


function Supplier() {

  const token =
    localStorage.getItem(
      "token"
    );


  // =====================================================
  // STATE
  // =====================================================

  const [list, setList] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [form, setForm] =
    useState({

      supplier_name: "",

      phone: "",

      address: ""

    });


  // =====================================================
  // LOAD SUPPLIER
  // IMPORTANT:
  // โหลดข้อมูลทั้งหมดเสมอ ห้ามผูกการโหลดกับช่อง Search
  // เพราะก่อนหน้านี้ถ้า Search ว่าง จะ setList([])
  // ทำให้ Supplier ดูเหมือนหายและ Total Supplier เป็น 0
  // =====================================================

  const loadData =
    useCallback(
      async () => {

        try {

          const res =
            await fetch(
              `${API}/suppliers`,
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );


          const result =
            await res.json();


          if (
            !res.ok ||
            !result.success
          ) {

            setList([]);

            return;

          }


          setList(
            Array.isArray(
              result.data
            )
              ? result.data
              : []
          );


        } catch (err) {

          console.error(
            "Load supplier error:",
            err
          );

          setList([]);

        }

      },
      [token]
    );


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadData();

  }, [
    loadData
  ]);


  // =====================================================
  // SAVE
  // =====================================================

  const saveSupplier =
    async () => {

      try {

        if (
          !String(
            form.supplier_name || ""
          ).trim()
        ) {

          alert(
            "ກະລຸນາໃສ່ຊື່ຜູ້ສະໜອງ"
          );

          return;

        }


        let url =
          `${API}/suppliers`;

        let method =
          "POST";


        if (
          editId
        ) {

          url =
            `${API}/suppliers/${editId}`;

          method =
            "PUT";

        }


        const res =
          await fetch(
            url,
            {
              method,

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`
              },

              body:
                JSON.stringify({

                  supplier_name:
                    form.supplier_name.trim(),

                  phone:
                    form.phone.trim(),

                  address:
                    form.address.trim()

                })
            }
          );


        const result =
          await res.json();


        if (
          !res.ok ||
          !result.success
        ) {

          throw new Error(
            result.message ||
            "Save failed"
          );

        }


        alert(
          editId
            ? "ແກ້ໄຂສຳເລັດ"
            : "ບັນທຶກສຳເລັດ"
        );


        setEditId(
          null
        );


        setForm({

          supplier_name: "",

          phone: "",

          address: ""

        });


        await loadData();


      } catch (err) {

        console.error(
          "Save supplier error:",
          err
        );


        alert(
          "ບັນທຶກບໍ່ສຳເລັດ: " +
          err.message
        );

      }

    };


  // =====================================================
  // EDIT
  // =====================================================

  const editData =
    (item) => {

      setEditId(
        item.id
      );


      setForm({

        supplier_name:
          item.supplier_name || "",

        phone:
          item.phone || "",

        address:
          item.address || ""

      });


      window.scrollTo({

        top:
          0,

        behavior:
          "smooth"

      });

    };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit =
    () => {

      setEditId(
        null
      );


      setForm({

        supplier_name: "",

        phone: "",

        address: ""

      });

    };


  // =====================================================
  // DELETE
  // =====================================================

  const deleteData =
    async (id) => {

      if (
        !window.confirm(
          "ຢືນຢັນການລົບ ?"
        )
      ) {

        return;

      }


      try {

        const res =
          await fetch(
            `${API}/suppliers/${id}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        const result =
          await res.json();


        if (
          !res.ok ||
          !result.success
        ) {

          throw new Error(
            result.message ||
            "Delete failed"
          );

        }


        if (
          String(editId) ===
          String(id)
        ) {

          cancelEdit();

        }


        await loadData();


      } catch (err) {

        console.error(
          "Delete supplier error:",
          err
        );


        alert(
          "ລົບບໍ່ສຳເລັດ: " +
          err.message
        );

      }

    };


  // =====================================================
  // FILTER
  // ค้นหาจากข้อมูลที่โหลดไว้
  // =====================================================

  const keyword =
    search
      .trim()
      .toLowerCase();


  const filtered =
    keyword === ""

      ? list

      : list.filter(
          (item) => {

            const fields = [

              item.supplier_name,

              item.phone,

              item.address

            ];


            return fields.some(
              (value) =>

                String(
                  value ?? ""
                )
                  .toLowerCase()
                  .includes(
                    keyword
                  )
            );

          }
        );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            🏪 Supplier Management
          </h1>


          <p className="dashboard-subtitle">
            ຈັດການຂໍ້ມູນຜູ້ສະໜອງ
          </p>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="summary-grid">

        <div className="summary-card card-blue">

          <h4>
            Total Supplier
          </h4>


          <div className="summary-value">
            {list.length}
          </div>

        </div>


        <div className="summary-card card-green">

          <h4>
            ຜົນການຄົ້ນຫາ
          </h4>


          <div className="summary-value">
            {filtered.length}
          </div>

        </div>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <div className="panel">

        <h3 className="supplier-title">

          {editId
            ? "✏️ Edit Supplier"
            : "➕ New Supplier"}

        </h3>


        <div className="supplier-form-grid">

          <input
            placeholder="ຊື່ຜູ້ສະໜອງ"
            value={
              form.supplier_name
            }
            onChange={(e) =>
              setForm(
                (prev) => ({

                  ...prev,

                  supplier_name:
                    e.target.value

                })
              )
            }
          />


          <input
            placeholder="ເບີໂທ"
            value={
              form.phone
            }
            onChange={(e) =>
              setForm(
                (prev) => ({

                  ...prev,

                  phone:
                    e.target.value

                })
              )
            }
          />

        </div>


        <textarea
          className="supplier-textarea"
          placeholder="ທີ່ຢູ່"
          value={
            form.address
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                address:
                  e.target.value

              })
            )
          }
        />


        <button
          className="supplier-save-btn"
          type="button"
          onClick={
            saveSupplier
          }
        >

          {editId
            ? "💾 ແກ້ໄຂ"
            : "💾 ບັນທຶກ"}

        </button>


        {editId && (

          <button
            type="button"
            onClick={
              cancelEdit
            }
            style={{
              marginLeft:
                "10px"
            }}
          >

            ❌ ຍົກເລີກ

          </button>

        )}

      </div>


      {/* =================================================
          SUPPLIER LIST
      ================================================= */}

      <div className="panel">

        <div className="supplier-toolbar">

          <h3>
            📋 Supplier List
          </h3>


          <input
            className="search-input supplier-search"
            placeholder="🔍 Search Supplier..."
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


        <table className="modern-table">

          <thead>

            <tr>

              <th width="70">
                ID
              </th>

              <th>
                ຊື່ຜູ້ສະໜອງ
              </th>

              <th width="180">
                ເບີໂທ
              </th>

              <th>
                ທີ່ຢູ່
              </th>

              <th width="150">
                ຈັດການ
              </th>

            </tr>

          </thead>


          <tbody>

            {filtered.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="supplier-empty"
                >

                  ບໍ່ພົບຂໍ້ມູນ Supplier

                </td>

              </tr>

            ) : (

              filtered.map(
                (item) => (

                  <tr
                    key={
                      item.id
                    }
                  >

                    <td>
                      {item.id}
                    </td>


                    <td>

                      <strong>
                        {item.supplier_name}
                      </strong>

                    </td>


                    <td>
                      {item.phone || "-"}
                    </td>


                    <td>
                      {item.address || "-"}
                    </td>


                    <td>

                      <div className="supplier-action">

                        <button
                          className="btn-edit"
                          type="button"
                          onClick={() =>
                            editData(
                              item
                            )
                          }
                        >

                          ✏️

                        </button>


                        <button
                          className="btn-delete"
                          type="button"
                          onClick={() =>
                            deleteData(
                              item.id
                            )
                          }
                        >

                          🗑

                        </button>

                      </div>

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


export default Supplier;