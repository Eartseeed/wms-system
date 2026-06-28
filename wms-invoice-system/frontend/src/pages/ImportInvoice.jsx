import {
  useEffect,
  useState
} from "react";

function ImportInvoice() {

const [list,setList] =
useState([]);

const [search,setSearch] =
useState("");

const [editId,setEditId] =
useState(null);

const [docType,setDocType] =
useState("invoice_file");

const [files,setFiles] =
useState({});

const [oldFiles,setOldFiles] =
useState({});

const [form,setForm] =
useState({

invoice_no:"",
product_name:"",

qty:"",
unit:"",

unit_weight:"",
weight:"",

unit_price:"",
total_price:"",

supplier:"",
invoice_date:""

});

const loadData =
async ()=>{

try{

const res =
await fetch(
"http://localhost:3002/invoices"
);

const data =
await res.json();

setList(
data || []
);

}catch(err){

console.log(err);

}

};

useEffect(()=>{

loadData();

},[]);

const saveData =
async ()=>{

try{

const formData =
new FormData();

Object.keys(form)
.forEach(key=>{

formData.append(
key,
form[key]
);

});

Object.keys(files)
.forEach(key=>{

formData.append(
key,
files[key]
);

});

let url =
"http://localhost:3002/import-invoice";

let method =
"POST";

if(editId){

url =
`http://localhost:3002/invoice/${editId}`;

method =
"PUT";

}

const res =
await fetch(

url,

method==="POST"

? {
method,
body:formData
}

: {
method,
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify(form)
}

);
if(!res.ok){

throw new Error(
"Save Failed"
);

}
const result =
await res.json();

if(result.success){

alert(
"ບັນທຶກສຳເລັດ"
);

setEditId(null);

setFiles({});
setOldFiles({});

setForm({

invoice_no:"",
product_name:"",

qty:"",
unit:"",

unit_weight:"",
weight:"",

unit_price:"",
total_price:"",

supplier:"",
invoice_date:""

});

loadData();

}

}catch(err){

console.log(err);

alert(
"ບັນທຶກບໍ່ສຳເລັດ"
);

}

};

const deleteData =
async(id)=>{

if(
!window.confirm(
"ຢືນຢັນການລຶບ ?"
)
){
return;
}

await fetch(

`http://localhost:3002/invoice/${id}`,

{
method:"DELETE"
}

);

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

    supplier: item.supplier || "",
    invoice_date: item.invoice_date || ""

  });

  setOldFiles({

    invoice_file: item.invoice_file,
    acdd_file: item.acdd_file,
    formd_file: item.formd_file,
    truck_file: item.truck_file,
    payment_file: item.payment_file,
    fda_file: item.fda_file,
    import_license_file: item.import_license_file

  });

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

};
const filtered =
search.trim() === ""
? []
: list.filter(item=>{

const keyword =
search.toLowerCase();

return(

(item.invoice_no || "")
.toLowerCase()
.includes(keyword)

||

(item.product_name || "")
.toLowerCase()
.includes(keyword)

||

(item.supplier || "")
.toLowerCase()
.includes(keyword)

);

});
return (

<div>

<h1>
📥 ນຳເຂົ້າສິນຄ້າ
</h1>

<div className="card">

<h3>
📦 ຂໍ້ມູນສິນຄ້າ
</h3>

<input
placeholder="ເລກ Invoice"
value={form.invoice_no}
onChange={(e)=>
setForm({
...form,
invoice_no:e.target.value
})
}
/>

<input
placeholder="ຊື່ສິນຄ້າ"
value={form.product_name}
onChange={(e)=>
setForm({
...form,
product_name:e.target.value
})
}
/>

<input
placeholder="ຈຳນວນ"
value={form.qty}
onChange={(e)=>
setForm({
...form,
qty:e.target.value
})
}
/>

<input
placeholder="ຫົວໜ່ວຍ"
value={form.unit}
onChange={(e)=>
setForm({
...form,
unit:e.target.value
})
}
/>

<input
placeholder="ນ້ຳໜັກຕໍ່ໜ່ວຍ"
value={form.unit_weight}
onChange={(e)=>
setForm({
...form,
unit_weight:e.target.value
})
}
/>

<input
placeholder="ນ້ຳໜັກລວມ"
value={form.weight}
onChange={(e)=>
setForm({
...form,
weight:e.target.value
})
}
/>

<input
placeholder="ລາຄາຕໍ່ໜ່ວຍ"
value={form.unit_price}
onChange={(e)=>
setForm({
...form,
unit_price:e.target.value
})
}
/>

<input
placeholder="ລາຄາລວມ"
value={form.total_price}
onChange={(e)=>
setForm({
...form,
total_price:e.target.value
})
}
/>

<input
placeholder="ຜູ້ສະໜອງ"
value={form.supplier}
onChange={(e)=>
setForm({
...form,
supplier:e.target.value
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

{editId
? "💾 ແກ້ໄຂ"
: "💾 ບັນທຶກ"}

</button>

</div>

<div
className="card"
style={{
marginTop:"20px"
}}
>

<h3>
📎 ເອກະສານນຳເຂົ້າ
</h3>

<select
value={docType}
onChange={(e)=>
setDocType(
e.target.value
)
}
>
  <option value="invoice_file">

Invoice

</option>



<option value="acdd_file">

ໃບຂົນ ACDD

</option>



<option value="formd_file">

FORMD

</option>



<option value="truck_file">

ໃບລົດ

</option>



<option value="payment_file">

ໃບໂອນເງິນ

</option>



<option value="fda_file">

ໃບຢັ້ງຢືນ ອຍ

</option>



<option value="import_license_file">

ໃບອານຸຍາດນຳເຂົ້າ

</option>
</select>

<input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => {

    const file = e.target.files[0];

    if (!file) return;

    setFiles({
      ...files,
      [docType]: file
    });

  }}
/>
{/* ตรงนี้แหละที่ให้ใส่ */}

<div style={{ marginTop:"15px" }}>

{Object.keys(files).length === 0 &&
 Object.values(oldFiles).filter(Boolean).length === 0 ? (

  <p>ຍັງບໍ່ມີເອກະສານ</p>

) : (

  <>

    {Object.entries(oldFiles)
      .filter(([_, file]) => file)
      .map(([type, file]) => (

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

    {Object.entries(files).map(([type,file]) => (

      <div
        key={type}
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          padding:"8px",
          borderBottom:"1px solid #ddd"
        }}
      >

        <span>{file.name}</span>

        <button
          type="button"
          onClick={() => {

            const temp = { ...files };
            delete temp[type];
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

<div
className="card"
style={{
marginTop:"20px"
}}
>

<h3>
🔍 ຄົ້ນຫາ
</h3>

<input
placeholder="ຄົ້ນຫາ Invoice / ສິນຄ້າ / Supplier"
value={search}
onChange={(e)=>
setSearch(
e.target.value
)
}
/>

</div>

<div
className="card"
style={{
marginTop:"20px"
}}
>

<h3>
📋 ຜົນການຄົ້ນຫາ
</h3>

<table
border="1"
width="100%"
cellPadding="10"
>

<thead>

<tr>

<th>ID</th>

<th>Invoice</th>

<th>ສິນຄ້າ</th>

<th>Qty</th>

<th>Weight</th>

<th>Supplier</th>

<th>ເອກະສານ</th>

<th>ຈັດການ</th>

</tr>

</thead>

<tbody>

{

search.trim() === "" ? (

<tr>
<td
colSpan="8"
align="center"
>
ພິມ Invoice ເພື່ອຄົ້ນຫາ
</td>
</tr>

) : filtered.length===0 ? (

<tr>
<td
colSpan="8"
align="center"
>
ບໍ່ພົບຂໍ້ມູນ
</td>
</tr>

) : (

filtered.map(item=>(
  

<tr key={item.id}>

<td>
{item.id}
</td>

<td>
{item.invoice_no}
</td>

<td>
{item.product_name}
</td>

<td>
{item.qty}
</td>

<td>
{item.weight}
</td>

<td>
{item.supplier}
</td>

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

  {item.formd_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.formd_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 FORMD
      </a>
      <br />
    </>
  )}

  {item.truck_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.truck_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 ໃບລົດ
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
        📄 ໃບໂອນເງິນ
      </a>
      <br />
    </>
  )}

  {item.fda_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.fda_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 ອຍ
      </a>
      <br />
    </>
  )}

  {item.import_license_file && (
    <>
      <a
        href={`http://localhost:3002/uploads/${item.import_license_file}`}
        target="_blank"
        rel="noreferrer"
      >
        📄 Import License
      </a>
      <br />
    </>
  )}

</td>
<td>

<button
onClick={()=>
editData(item)
}
>

✏️

</button>

<button
onClick={()=>
deleteData(item.id)
}
>

🗑

</button>

</td>

</tr>

))

)

}

</tbody>

</table>

</div>

</div>

);

}

export default ImportInvoice;