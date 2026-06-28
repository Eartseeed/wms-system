import {
useEffect,
useState
}
from "react";

function Supplier(){

const [list,setList] =
useState([]);

const [search,setSearch] =
useState("");

const [editId,setEditId] =
useState(null);

const [form,setForm] =
useState({

supplier_name:"",
phone:"",
address:"",
contact_person:""

});

const loadData =
async()=>{

const res =
await fetch(
"http://localhost:3002/suppliers"
);

const data =
await res.json();

setList(data || []);

};

useEffect(()=>{

loadData();

},[]);

const saveSupplier =
async()=>{

try{

let url =
"http://localhost:3002/suppliers";

let method =
"POST";

if(editId){

url =
`http://localhost:3002/supplier/${editId}`;

method =
"PUT";

}

const res =
await fetch(

url,

{
method,
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify(form)
}

);

const result =
await res.json();

if(result.success){

alert(
"ບັນທຶກສຳເລັດ"
);

setEditId(null);

setForm({

supplier_name:"",
phone:"",
address:"",
contact_person:""

});

loadData();

}

}catch(err){

console.log(err);

}

};

const editData =
(item)=>{

setEditId(item.id);

setForm({

supplier_name:
item.supplier_name || "",

phone:
item.phone || "",

address:
item.address || "",

contact_person:
item.contact_person || ""

});

};

const deleteData =
async(id)=>{

if(
!window.confirm(
"ຢືນຢັນການລົບ ?"
)
){
return;
}

await fetch(

`http://localhost:3002/supplier/${id}`,

{
method:"DELETE"
}

);

loadData();

};

const filtered =
list.filter(item=>{

const keyword =
search.toLowerCase();

return(

(item.supplier_name || "")
.toLowerCase()
.includes(keyword)

||

(item.phone || "")
.toLowerCase()
.includes(keyword)

||

(item.contact_person || "")
.toLowerCase()
.includes(keyword)

);

});

return(

<div>

<h1>
🏪 ຜູ້ສະໜອງ
</h1>

<div className="card">

<h3>
➕ ຂໍ້ມູນຜູ້ສະໜອງ
</h3>

<input
placeholder="ຊື່ຜູ້ສະໜອງ"
value={form.supplier_name}
onChange={(e)=>
setForm({
...form,
supplier_name:e.target.value
})
}
/>

<input
placeholder="ເບີໂທ"
value={form.phone}
onChange={(e)=>
setForm({
...form,
phone:e.target.value
})
}
/>

<input
placeholder="ຜູ້ຕິດຕໍ່"
value={form.contact_person}
onChange={(e)=>
setForm({
...form,
contact_person:e.target.value
})
}
/>

<textarea
placeholder="ທີ່ຢູ່"
value={form.address}
onChange={(e)=>
setForm({
...form,
address:e.target.value
})
}
/>

<button onClick={saveSupplier}>

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
🔍 ຄົ້ນຫາ
</h3>

<input
placeholder="ຄົ້ນຫາ Supplier"
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

<table
border="1"
width="100%"
cellPadding="10"
>

<thead>

<tr>

<th>ID</th>

<th>
ຊື່ບໍລິສັດ
</th>

<th>
ເບີໂທ
</th>

<th>
ຜູ້ຕິດຕໍ່
</th>

<th>
ທີ່ຢູ່
</th>

<th>
ຈັດການ
</th>

</tr>

</thead>

<tbody>

{

filtered.length===0

?

<tr>

<td
colSpan="6"
align="center"
>

ບໍ່ມີຂໍ້ມູນ

</td>

</tr>

:

filtered.map(item=>(

<tr key={item.id}>

<td>
{item.id}
</td>

<td>
{item.supplier_name}
</td>

<td>
{item.phone}
</td>

<td>
{item.contact_person}
</td>

<td>
{item.address}
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

}

</tbody>

</table>

</div>

</div>

);

}

export default Supplier;