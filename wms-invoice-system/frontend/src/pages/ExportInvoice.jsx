import { useEffect, useState } from "react";

function ExportInvoice() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [docType, setDocType] = useState("invoice_file");
  const [files, setFiles] = useState({});
const [oldFiles,setOldFiles] = useState({});
  

const [invoiceSearch, setInvoiceSearch] =
useState("");

  const [form, setForm] = useState({
    invoice_no: "",
    product_name: "",
    qty: "",
    unit: "",
    unit_weight: "",
    weight: "",
    unit_price: "",
    total_price: "",
    customer: "",
    invoice_date: "",
  });

  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:3002/exports");
      const data = await res.json();
      setList(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      Object.keys(files).forEach((key) => {
        formData.append(key, files[key]);
      });

      let url = "http://localhost:3002/export-invoice";
      let method = "POST";

      if (editId) {
        url = `http://localhost:3002/export/${editId}`;
        method = "PUT";
      }

      const res = await fetch(
        url,
        method === "POST"
          ? {
              method,
              body: formData,
            }
          : {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(form),
            }
      );

      const result = await res.json();

      if (result.success) {
        alert("ບັນທຶກສຳເລັດ");

        setEditId(null);
setFiles({});
setOldFiles({});

        setForm({
          invoice_no: "",
          product_name: "",
          qty: "",
          unit: "",
          unit_weight: "",
          weight: "",
          unit_price: "",
          total_price: "",
          customer: "",
          invoice_date: "",
        });

        loadData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteData = async (id) => {
    if (!window.confirm("ຢືນຢັນການລົບ ?")) return;

    await fetch(`http://localhost:3002/export/${id}`, {
      method: "DELETE",
    });

    loadData();
  };

  const editData = (item) => {

  setEditId(item.id);

  setForm({
    invoice_no: item.invoice_no || "",
    product_name: item.product_name || "",
    qty: item.qty || "",
    unit: item.unit || "",
    unit_weight: item.unit_weight || "",
    weight: item.weight || "",
    unit_price: item.unit_price || "",
    total_price: item.total_price || "",
    customer: item.customer || "",
    invoice_date: item.invoice_date || "",
  });

  setOldFiles({

    invoice_file:item.invoice_file,
    payment_file:item.payment_file,
    formd_file:item.formd_file,
    phytos_file:item.phytos_file,
    tax_file:item.tax_file,
    export_license_file:item.export_license_file,
    origin_file:item.origin_file,
    acdd_file:item.acdd_file

  });

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

};
const loadInvoice = async () => {

  const res = await fetch(
    `http://localhost:3002/import-invoice/${invoiceSearch}`
  );

  const data = await res.json();

  if(!data.id){
    alert("ไม่พบ Invoice");
    return;
  }

  setForm({

    invoice_no:data.invoice_no || "",
    product_name:data.product_name || "",

    qty:data.qty || "",
    unit:data.unit || "",

    unit_weight:data.unit_weight || "",
    weight:data.weight || "",

    unit_price:data.unit_price || "",
    total_price:data.total_price || "",

    customer:"",
    invoice_date:new Date()
      .toISOString()
      .slice(0,10)

  });

};
  const filtered =
search.trim()===""
? []
: list.filter((item) => {

const keyword =
search.toLowerCase();

return (
  (item.invoice_no || "")
    .toLowerCase()
    .includes(keyword)

  ||

  (item.product_name || "")
    .toLowerCase()
    .includes(keyword)

  ||

  (item.customer || "")
    .toLowerCase()
    .includes(keyword)
);

});

  return (
    <div className="page">
      <h1>📤 ສົ່ງອອກສິນຄ້າ</h1>

      <div className="card">
        <h3>📦 ຂໍ້ມູນສິນຄ້າ</h3>
<div style={{display:"flex",gap:"10px"}}>

  <input
    placeholder="ໃສ່ເລກ Invoice ທີ່ຈະນຳອອກ"
    value={invoiceSearch}
    onChange={(e)=>
      setInvoiceSearch(e.target.value)
    }
  />

  <button
    type="button"
    onClick={loadInvoice}
  >
    📥 ดึงข้อมูล
  </button>

</div>
        <input
          placeholder="ເລກ Invoice"
          value={form.invoice_no}
          onChange={(e) =>
            setForm({
              ...form,
              invoice_no: e.target.value,
            })
          }
        />

        <input
          placeholder="ຊື່ສິນຄ້າ"
          value={form.product_name}
          onChange={(e) =>
            setForm({
              ...form,
              product_name: e.target.value,
            })
          }
        />

        <input
          placeholder="ຈຳນວນ"
          value={form.qty}
          onChange={(e) =>
            setForm({
              ...form,
              qty: e.target.value,
            })
          }
        />

        <input
          placeholder="ຫົວໜ່ວຍ"
          value={form.unit}
          onChange={(e) =>
            setForm({
              ...form,
              unit: e.target.value,
            })
          }
        />

        <input
          placeholder="ນ້ຳໜັກຕໍ່ໜ່ວຍ"
          value={form.unit_weight}
          onChange={(e) =>
            setForm({
              ...form,
              unit_weight: e.target.value,
            })
          }
        />

        <input
          placeholder="ນ້ຳໜັກລວມ"
          value={form.weight}
          onChange={(e) =>
            setForm({
              ...form,
              weight: e.target.value,
            })
          }
        />

        <input
          placeholder="ລາຄາຕໍ່ໜ່ວຍ"
          value={form.unit_price}
          onChange={(e) =>
            setForm({
              ...form,
              unit_price: e.target.value,
            })
          }
        />

        <input
          placeholder="ລາຄາລວມ"
          value={form.total_price}
          onChange={(e) =>
            setForm({
              ...form,
              total_price: e.target.value,
            })
          }
        />

        <input
          placeholder="ລູກຄ້າ"
          value={form.customer}
          onChange={(e) =>
            setForm({
              ...form,
              customer: e.target.value,
            })
          }
        />

        <input
  type="date"
  value={form.invoice_date}
  onChange={(e) =>
    setForm({
      ...form,
      invoice_date: e.target.value
    })
  }
  onClick={(e) => e.target.showPicker()}
/>

        <button onClick={saveData}>
          {editId ? "💾 ແກ້ໄຂ" : "💾 ບັນທຶກ"}
        </button>
      </div>

      <div className="card">
  <h3>📎 ແນບເອກະສານສົ່ງອອກ</h3>

  <select
    value={docType}
    onChange={(e) => setDocType(e.target.value)}
  >
    <option value="invoice_file">INVOICE</option>
    <option value="payment_file">ໃບໂອນເງິນ</option>
    <option value="formd_file">FORM D</option>
    <option value="phytos_file">PHYTOS</option>
    <option value="tax_file">ໃບມອບອາກອນ</option>
    <option value="export_license_file">ໃບອານຸຍາດສົ່ງອອກ</option>
    <option value="origin_file">ໃບຢັ້ງຢືນແຫຼ່ງກຳເນີດ</option>
    <option value="acdd_file">ໃບແຈ້ງ ACDD</option>
  </select>

  <input
    type="file"
    onChange={(e) => {
      const file = e.target.files[0];

      if (!file) return;

      setFiles({
        ...files,
        [docType]: file,
      });
    }}
  />

  <div style={{ marginTop: "10px" }}>

  {Object.keys(files).length === 0 &&
 Object.values(oldFiles).filter(Boolean).length === 0 ? (

    <p>ຍັງບໍ່ມີເອກະສານ</p>

  ) : (

    <>

{Object.entries(oldFiles)
.filter(([_,file]) => file)
.map(([type,file]) => (

<div
  key={type}
  style={{
    display:"flex",
    justifyContent:"space-between",
    padding:"8px",
    borderBottom:"1px solid #ddd"
  }}
>

  <a
    href={`http://localhost:3002/uploads/${file}`}
    target="_blank"
    rel="noreferrer"
  >
    📄 {file}
  </a>

</div>

))}

{Object.entries(files).map(([key,file]) => (

<div
  key={key}
  style={{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:"5px"
  }}
>

  <span>{file?.name}</span>

  <button
    type="button"
    onClick={() => {

      const temp = {...files};
      delete temp[key];
      setFiles(temp);

    }}
  >
    ❌
  </button>

</div>

))}

</>

  )}

</div>
</div>

      <div className="card">
        <input
          placeholder="ຄົ້ນຫາ Invoice / Product / Customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
  <tr>
    <th>ID</th>
    <th>Invoice</th>
    <th>Product</th>
    <th>Qty</th>
    <th>Weight</th>

    <th>Unit Price</th>
    <th>Total Price</th>

    <th>Customer</th>
    <th>Date</th>
    <th>Files</th>
    <th>Action</th>
  </tr>
</thead>

        <tbody>

{search.trim() === "" ? (

<tr>
  <td colSpan="11" align="center">
    ພິມ Invoice ເພື່ອຄົ້ນຫາ
  </td>
</tr>

) : filtered.length === 0 ? (

<tr>
  <td colSpan="11" align="center">
    ບໍ່ພົບຂໍ້ມູນ
  </td>
</tr>

) : (

filtered.map((item) => (

<tr key={item.id}>

  <td>{item.id}</td>

  <td>{item.invoice_no}</td>

  <td>{item.product_name}</td>

  <td>{item.qty}</td>

  <td>{item.weight}</td>

  <td>{item.unit_price}</td>

  <td>{item.total_price}</td>

  <td>{item.customer}</td>

  <td>{item.invoice_date}</td>

  <td>

  {item.invoice_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.invoice_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 Invoice
      </a>
      <br />
    </>
  )}

  {item.payment_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.payment_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 Payment
      </a>
      <br />
    </>
  )}

  {item.formd_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.formd_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 FORM D
      </a>
      <br />
    </>
  )}

  {item.phytos_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.phytos_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 PHYTOS
      </a>
      <br />
    </>
  )}

  {item.tax_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.tax_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 Tax
      </a>
      <br />
    </>
  )}

  {item.export_license_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.export_license_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 Export License
      </a>
      <br />
    </>
  )}

  {item.origin_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.origin_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 Origin
      </a>
      <br />
    </>
  )}

  {item.acdd_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.acdd_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 ACDD
      </a>
      <br />
    </>
  )}

</td>

  <td>

    <button
      onClick={() => editData(item)}
    >
      ✏️ Edit
    </button>

    <button
      onClick={() => deleteData(item.id)}
    >
      🗑 Delete
    </button>

  </td>

</tr>

))

)}

</tbody>
      </table>
    </div>
  );
}

export default ExportInvoice;