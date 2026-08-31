import { useEffect, useState, useCallback } from "react";
import { API } from "../config/api";

function Supplier() {
  const token = localStorage.getItem("token");

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    supplier_name: "",
    phone: "",
    address: "",
  });

  const loadData = useCallback(async (keyword = "") => {

  try {

    const res = await fetch(

      `${API}/suppliers?search=${encodeURIComponent(keyword)}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

    );

    const result = await res.json();

    if (result.success) {
      setList(result.data || []);
    } else {
      setList([]);
    }

  } catch (err) {

    console.log(err);

    setList([]);

  }

}, [token]);

  useEffect(() => {

  if (search.trim() === "") {

    setList([]);

    return;

  }

  const timer = setTimeout(() => {

    loadData(search);

  }, 300);

  return () => clearTimeout(timer);

}, [search, loadData]);

  const saveSupplier = async () => {
    try {
      let url = `${API}/suppliers`;
      let method = "POST";

      if (editId) {
        url = `${API}/suppliers/${editId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (result.success) {
        alert("ບັນທຶກສຳເລັດ");

        setEditId(null);

        setForm({
          supplier_name: "",
          phone: "",
          address: "",
        });

        loadData(search);
      } else {
        alert(result.message || "Save Failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const editData = (item) => {
    setEditId(item.id);

    setForm({
      supplier_name: item.supplier_name || "",
      phone: item.phone || "",
      address: item.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteData = async (id) => {
    if (!window.confirm("ຢືນຢັນການລົບ ?")) return;

    try {
      const res = await fetch(`${API}/suppliers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (result.success) {
        loadData(search);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.log(err);
    }
  };


  const showTable = search.trim() !== "";

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">🏪 Supplier Management</h1>

          <p className="dashboard-subtitle">
            ຈັດການຂໍ້ມູນຜູ້ສະໜອງ
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card-blue">
          <h4>Total Supplier</h4>

          <div className="summary-value">
            {list.length}
          </div>
        </div>

        <div className="summary-card card-green">
          <h4>ຜົນການຄົ້ນຫາ</h4>

          <div className="summary-value">
            {list.length}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="supplier-title">
          {editId ? "✏️ Edit Supplier" : "➕ New Supplier"}
        </h3>

        <div className="supplier-form-grid">
          <input
            placeholder="ຊື່ຜູ້ສະໜອງ"
            value={form.supplier_name}
            onChange={(e) =>
              setForm({
                ...form,
                supplier_name: e.target.value,
              })
            }
          />

          <input
            placeholder="ເບີໂທ"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />
        </div>

        <textarea
          className="supplier-textarea"
          placeholder="ທີ່ຢູ່"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />

        <button
          className="supplier-save-btn"
          onClick={saveSupplier}
        >
          {editId ? "💾 ແກ້ໄຂ" : "💾 ບັນທຶກ"}
        </button>
      </div>

      <div className="panel">
        <div className="supplier-toolbar">
          <h3>📋 Supplier List</h3>

          <input
            className="search-input supplier-search"
            placeholder="🔍 Search Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showTable && (
          <table className="modern-table">
            <thead>
              <tr>
                <th width="70">ID</th>
                <th>ຊື່ຜູ້ສະໜອງ</th>
                <th width="180">ເບີໂທ</th>
                <th>ທີ່ຢູ່</th>
                <th width="150">ຈັດການ</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="5" className="supplier-empty">
                    ບໍ່ພົບຂໍ້ມູນ Supplier
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>

                    <td>
                      <strong>{item.supplier_name}</strong>
                    </td>

                    <td>{item.phone}</td>

                    <td>{item.address}</td>

                    <td>
                      <div className="supplier-action">
                        <button
                          className="btn-edit"
                          onClick={() => editData(item)}
                        >
                          ✏️
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => deleteData(item.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Supplier;