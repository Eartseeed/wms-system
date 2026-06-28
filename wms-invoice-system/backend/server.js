  const express = require("express");
  const cors = require("cors");
  const sqlite3 = require("sqlite3").verbose();
  const multer = require("multer");
  const fs = require("fs");
  const ExcelJS = require("exceljs");

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended:true }));

  app.use(
    "/uploads",
    express.static("uploads")
  );

  /* =========================
  UPLOAD FOLDER
  ========================= */

  if(!fs.existsSync("./uploads")){
    fs.mkdirSync("./uploads");
  }

  /* =========================
  DATABASE
  ========================= */

  const db =
  new sqlite3.Database(
    "./invoice.db"
  );

  /* =========================
  TABLES
  ========================= */

  db.serialize(()=>{

    /* IMPORT */

    db.run(`

    CREATE TABLE IF NOT EXISTS invoices(

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      invoice_no TEXT,
      product_name TEXT,

      qty REAL,
      unit TEXT,

      unit_weight REAL,
      weight REAL,

      unit_price REAL,
      total_price REAL,

      supplier TEXT,
      invoice_date TEXT,

      invoice_file TEXT,
      acdd_file TEXT,
      formd_file TEXT,
      truck_file TEXT,
      payment_file TEXT,
      fda_file TEXT,
      import_license_file TEXT,

      created_at DATETIME
      DEFAULT CURRENT_TIMESTAMP

    )

    `);

    /* EXPORT */

    db.run(`

    CREATE TABLE IF NOT EXISTS exports(

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      invoice_no TEXT,
      product_name TEXT,

      qty REAL,
      unit TEXT,

      unit_weight REAL,
      weight REAL,

      unit_price REAL,
      total_price REAL,

      customer TEXT,
      invoice_date TEXT,

      invoice_file TEXT,
      payment_file TEXT,
      formd_file TEXT,
      phytos_file TEXT,
      tax_file TEXT,
      export_license_file TEXT,
      origin_file TEXT,
      acdd_file TEXT,

      created_at DATETIME
      DEFAULT CURRENT_TIMESTAMP

    )

    `);

    /* SUPPLIER */

    db.run(`

    CREATE TABLE IF NOT EXISTS suppliers(

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      supplier_name TEXT,
      phone TEXT,
      address TEXT,
      contact_person TEXT

    )

    `);

  });

  /* =========================
  MULTER
  ========================= */

  const storage =
  multer.diskStorage({

    destination:function(
      req,
      file,
      cb
    ){

      cb(
        null,
        "uploads/"
      );

    },

    filename:function(
      req,
      file,
      cb
    ){

      cb(
        null,
        Date.now() +
        "-" +
        file.originalname
      );

    }

  });

  const upload =
  multer({
    storage
  });

  /* =========================
  IMPORT FILES
  ========================= */

  const uploadImport =
  upload.fields([

  {
    name:"invoice_file",
    maxCount:1
  },

  {
    name:"acdd_file",
    maxCount:1
  },

  {
    name:"formd_file",
    maxCount:1
  },

  {
    name:"truck_file",
    maxCount:1
  },

  {
    name:"payment_file",
    maxCount:1
  },

  {
    name:"fda_file",
    maxCount:1
  },

  {
    name:"import_license_file",
    maxCount:1
  }

  ]);

  /* =========================
  EXPORT FILES
  ========================= */

  const uploadExport =
  upload.fields([

  {
    name:"invoice_file",
    maxCount:1
  },

  {
    name:"payment_file",
    maxCount:1
  },

  {
    name:"formd_file",
    maxCount:1
  },

  {
    name:"phytos_file",
    maxCount:1
  },

  {
    name:"tax_file",
    maxCount:1
  },

  {
    name:"export_license_file",
    maxCount:1
  },

  {
    name:"origin_file",
    maxCount:1
  },

  {
    name:"acdd_file",
    maxCount:1
  }

  ]);
  /* =========================
  IMPORT INVOICE
  ========================= */

app.post(
"/import-invoice",
uploadImport,
(req,res)=>{

console.log("BODY");
console.log(req.body);

console.log("FILES");
console.log(req.files);

const files =
req.files || {};

  const {

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  supplier,
  invoice_date

  } = req.body;

  db.run(

  `
  INSERT INTO invoices(

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  supplier,
  invoice_date,

  invoice_file,
  acdd_file,
  formd_file,
  truck_file,
  payment_file,
  fda_file,
  import_license_file

  )

  VALUES(
  ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
  )
  `,

  [

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  supplier,
  invoice_date,

  files.invoice_file?.[0]?.filename || null,
  files.acdd_file?.[0]?.filename || null,
  files.formd_file?.[0]?.filename || null,
  files.truck_file?.[0]?.filename || null,
  files.payment_file?.[0]?.filename || null,
  files.fda_file?.[0]?.filename || null,
  files.import_license_file?.[0]?.filename || null

  ],

  function(err){

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json({

  success:true,
  id:this.lastID

  });

  }

  );

  }
  );

  /* =========================
  EXPORT INVOICE
  ========================= */

  app.post(
  "/export-invoice",
  uploadExport,
  (req,res)=>{

  const files =
  req.files || {};

  const {

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  customer,
  invoice_date

  } = req.body;

  db.run(

  `
  INSERT INTO exports(

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  customer,
  invoice_date,

  invoice_file,
  payment_file,
  formd_file,
  phytos_file,
  tax_file,
  export_license_file,
  origin_file,
  acdd_file

  )

  VALUES(
  ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
  )
  `,

  [

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  customer,
  invoice_date,

  files.invoice_file?.[0]?.filename || null,
  files.payment_file?.[0]?.filename || null,
  files.formd_file?.[0]?.filename || null,
  files.phytos_file?.[0]?.filename || null,
  files.tax_file?.[0]?.filename || null,
  files.export_license_file?.[0]?.filename || null,
  files.origin_file?.[0]?.filename || null,
  files.acdd_file?.[0]?.filename || null

  ],

  function(err){

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json({

  success:true,
  id:this.lastID

  });

  }

  );

  }
  );

  /* =========================
  GET INVOICES
  ========================= */
app.get(
  "/import-invoice/:invoice_no",
  (req,res)=>{

    db.get(
      `
      SELECT *
      FROM invoices
      WHERE invoice_no = ?
      `,
      [req.params.invoice_no],
      (err,row)=>{

        if(err){
          return res.status(500).json(err);
        }

        res.json(row || {});
      }
    );

  }
);
app.get(
  "/export/:invoice_no",
  (req,res)=>{

    db.get(
      `
      SELECT *
      FROM exports
      WHERE invoice_no = ?
      `,
      [req.params.invoice_no],
      (err,row)=>{

        if(err){
          return res.status(500).json(err);
        }

        res.json(row || {});
      }
    );

  }
);

  app.get(
  "/invoices",
  (req,res)=>{

  db.all(

  `
  SELECT *
  FROM invoices
  ORDER BY id DESC
  `,

  [],

  (err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json(rows || []);

  }

  );

  }
  );

  app.get(
  "/exports",
  (req,res)=>{

  db.all(

  `
  SELECT *
  FROM exports
  ORDER BY id DESC
  `,

  [],

  (err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json(rows || []);

  }

  );

  }
  );

  /* =========================
  DELETE
  ========================= */

  app.delete("/invoice/:id", (req, res) => {
  db.run(
    `
    DELETE FROM invoices
    WHERE id = ?
    `,
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "ลบข้อมูลสำเร็จ",
      });
    }
  );
});

app.delete("/export/:id", (req, res) => {
  db.run(
    `
    DELETE FROM exports
    WHERE id = ?
    `,
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "ลบข้อมูลสำเร็จ",
      });
    }
  );
});

  /* =========================
  SUPPLIER
  ========================= */

  app.get(
  "/suppliers",
  (req,res)=>{

  db.all(

  `
  SELECT *
  FROM suppliers
  ORDER BY id DESC
  `,

  [],

  (err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json(rows || []);

  }

  );

  }
  );

  app.post(
  "/suppliers",
  (req,res)=>{

  const {

  supplier_name,
  phone,
  address,
  contact_person

  } = req.body;

  db.run(

  `
  INSERT INTO suppliers(

  supplier_name,
  phone,
  address,
  contact_person

  )

  VALUES(
  ?,?,?,?
  )
  `,

  [
  supplier_name,
  phone,
  address,
  contact_person
  ],

  function(err){

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json({

  success:true,
  id:this.lastID

  });

  }

  );

  }
  );

  /* =========================
DASHBOARD
========================= */

app.get("/dashboard", (req, res) => {

  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;

  let importWhere = "WHERE 1=1";
  let exportWhere = "WHERE 1=1";

  const importParams = [];
  const exportParams = [];

  if (dateFrom) {
    importWhere += " AND DATE(invoice_date) >= ?";
    exportWhere += " AND DATE(invoice_date) >= ?";
    importParams.push(dateFrom);
    exportParams.push(dateFrom);
  }

  if (dateTo) {
    importWhere += " AND DATE(invoice_date) <= ?";
    exportWhere += " AND DATE(invoice_date) <= ?";
    importParams.push(dateTo);
    exportParams.push(dateTo);
  }

  db.get(
    `
    SELECT
      COUNT(*) AS totalImport,
      COALESCE(SUM(qty),0) AS importQty,
      COALESCE(SUM(weight),0) AS importWeight,
      COALESCE(SUM(total_price),0) AS importValue
    FROM invoices
    ${importWhere}
    `,
    importParams,
    (err, importData) => {

      if (err) {
        return res.status(500).json(err);
      }

      db.get(
        `
        SELECT
          COUNT(*) AS totalExport,
          COALESCE(SUM(qty),0) AS exportQty,
          COALESCE(SUM(weight),0) AS exportWeight,
          COALESCE(SUM(total_price),0) AS exportValue
        FROM exports
        ${exportWhere}
        `,
        exportParams,
        (err2, exportData) => {

          if (err2) {
            return res.status(500).json(err2);
          }

          const importQty = Number(importData.importQty || 0);
          const exportQty = Number(exportData.exportQty || 0);

          const importWeight = Number(importData.importWeight || 0);
          const exportWeight = Number(exportData.exportWeight || 0);

          const importValue = Number(importData.importValue || 0);
          const exportValue = Number(exportData.exportValue || 0);

          res.json({

            totalImport: Number(importData.totalImport || 0),
            totalExport: Number(exportData.totalExport || 0),

            importQty,
            exportQty,
            stockQty: importQty - exportQty,

            importWeight,
            exportWeight,
            stockWeight: importWeight - exportWeight,

            importValue,
            exportValue,

            balanceValue: exportValue - importValue,
            profit: exportValue - importValue

          });

        }
      );

    }
  );

});
  /* =========================
  STOCK SUMMARY
  ========================= */

  app.get(
  "/stocks",
  (req,res)=>{

  db.all(

  `
  SELECT

  product_name,

  SUM(import_qty)
  AS import_qty,

  SUM(export_qty)
  AS export_qty,

  SUM(import_qty)
  -
  SUM(export_qty)
  AS qty,

  SUM(import_weight)
  -
  SUM(export_weight)
  AS weight

  FROM(

  SELECT

  product_name,

  qty as import_qty,
  0 as export_qty,

  weight as import_weight,
  0 as export_weight

  FROM invoices

  UNION ALL

  SELECT

  product_name,

  0 as import_qty,
  qty as export_qty,

  0 as import_weight,
  weight as export_weight

  FROM exports

  )

  GROUP BY product_name

  ORDER BY product_name
  `,

  [],

  (err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json(rows || []);

  }

  );

  }
  );
  /* =========================
  RECENT IMPORT
  ========================= */

  app.get(
"/dashboard/recent-import",
(req,res)=>{

const page =
parseInt(req.query.page || 1);

const limit = 5;

const offset =
(page - 1) * limit;

const dateFrom =
req.query.dateFrom;

const dateTo =
req.query.dateTo;

let sql = `
SELECT *
FROM invoices
WHERE 1=1
`;

const params = [];

if(dateFrom){

sql += `
AND DATE(invoice_date) >= ?
`;

params.push(dateFrom);

}

if(dateTo){

sql += `
AND DATE(invoice_date) <= ?
`;

params.push(dateTo);

}

sql += `
ORDER BY id DESC
LIMIT ?
OFFSET ?
`;

params.push(limit);
params.push(offset);

db.all(
sql,
params,
(err,rows)=>{

if(err){

return res
.status(500)
.json(err);

}

res.json(
rows || []
);

}
);

}
);
  /* =========================
  RECENT EXPORT
  ========================= */

  app.get(
"/dashboard/recent-export",
(req,res)=>{

const page =
parseInt(req.query.page || 1);

const limit = 5;

const offset =
(page - 1) * limit;

const dateFrom =
req.query.dateFrom;

const dateTo =
req.query.dateTo;

let sql = `
SELECT *
FROM exports
WHERE 1=1
`;

const params = [];

if(dateFrom){

sql += `
AND DATE(invoice_date) >= ?
`;

params.push(dateFrom);

}

if(dateTo){

sql += `
AND DATE(invoice_date) <= ?
`;

params.push(dateTo);

}

sql += `
ORDER BY id DESC
LIMIT ?
OFFSET ?
`;

params.push(limit);
params.push(offset);

db.all(
sql,
params,
(err,rows)=>{

if(err){

return res
.status(500)
.json(err);

}

res.json(
rows || []
);

}
);

}
);
/* =========================
IMPORT TOTAL PAGE
========================= */

app.get(
"/dashboard/import-pages",
(req,res)=>{

const dateFrom =
req.query.dateFrom;

const dateTo =
req.query.dateTo;

let sql = `
SELECT COUNT(*) AS total
FROM invoices
WHERE 1=1
`;

const params = [];

if(dateFrom){

sql += `
AND DATE(invoice_date) >= ?
`;

params.push(dateFrom);

}

if(dateTo){

sql += `
AND DATE(invoice_date) <= ?
`;

params.push(dateTo);

}

db.get(
sql,
params,
(err,row)=>{

if(err){

return res
.status(500)
.json(err);

}

res.json({

total:
row.total || 0,

pages:
Math.ceil(
(row.total || 0) / 5
)

});

}

);

}
);

/* =========================
EXPORT TOTAL PAGE
========================= */

app.get(
"/dashboard/export-pages",
(req,res)=>{

const dateFrom =
req.query.dateFrom;

const dateTo =
req.query.dateTo;

let sql = `
SELECT COUNT(*) AS total
FROM exports
WHERE 1=1
`;

const params = [];

if(dateFrom){

sql += `
AND DATE(invoice_date) >= ?
`;

params.push(dateFrom);

}

if(dateTo){

sql += `
AND DATE(invoice_date) <= ?
`;

params.push(dateTo);

}

db.get(
sql,
params,
(err,row)=>{

if(err){

return res
.status(500)
.json(err);

}

res.json({

total:
row.total || 0,

pages:
Math.ceil(
(row.total || 0) / 5
)

});

}

);

}
);
  /* =========================
  LOW STOCK
  ========================= */

  app.get(
  "/dashboard/low-stock",
  (req,res)=>{

  db.all(

  `
  SELECT

  product_name,

  SUM(import_qty)
  -
  SUM(export_qty)
  AS qty

  FROM(

  SELECT

  product_name,
  qty AS import_qty,
  0 AS export_qty

  FROM invoices

  UNION ALL

  SELECT

  product_name,
  0 AS import_qty,
  qty AS export_qty

  FROM exports

  )

  GROUP BY product_name

  HAVING qty <= 10

  ORDER BY qty ASC
  `,

  [],

  (err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  res.json(rows || []);

  }

  );

  }
  );

  /* =========================
  EXPORT STOCK EXCEL
  ========================= */

  app.get(
  "/export-excel/stock",
  async(req,res)=>{

  try{

  const workbook =
  new ExcelJS.Workbook();

  const sheet =
  workbook.addWorksheet(
  "Stock Report"
  );

  sheet.columns = [

  {
  header:"Product",
  key:"product_name",
  width:30
  },

  {
  header:"Import Qty",
  key:"import_qty",
  width:15
  },

  {
  header:"Export Qty",
  key:"export_qty",
  width:15
  },

  {
  header:"Balance Qty",
  key:"qty",
  width:15
  },

  {
  header:"Weight",
  key:"weight",
  width:15
  }

  ];

  db.all(

  `
  SELECT

  product_name,

  SUM(import_qty)
  AS import_qty,

  SUM(export_qty)
  AS export_qty,

  SUM(import_qty)
  -
  SUM(export_qty)
  AS qty,

  SUM(import_weight)
  -
  SUM(export_weight)
  AS weight

  FROM(

  SELECT

  product_name,

  qty as import_qty,
  0 as export_qty,

  weight as import_weight,
  0 as export_weight

  FROM invoices

  UNION ALL

  SELECT

  product_name,

  0 as import_qty,
  qty as export_qty,

  0 as import_weight,
  weight as export_weight

  FROM exports

  )

  GROUP BY product_name
  `,

  [],

  async(err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  rows.forEach(row=>{

  sheet.addRow(row);

  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
  "Content-Disposition",
  'attachment; filename="Stock_Report.xlsx"'
  );

  await workbook.xlsx.write(res);

  res.end();

  }

  );

  }catch(err){

  res.status(500)
  .json(err);

  }

  }
  );

  /* =========================
EXPORT IMPORT EXCEL
========================= */

app.get(
"/export-excel/import",
async (req,res)=>{

const workbook =
new ExcelJS.Workbook();

const sheet =
workbook.addWorksheet(
"Import Report"
);

const dateFrom =
req.query.dateFrom;

const dateTo =
req.query.dateTo;

let sql = `
SELECT *
FROM invoices
WHERE 1=1
`;

const params = [];

if(dateFrom){
sql += `
AND DATE(invoice_date) >= ?
`;
params.push(dateFrom);
}

if(dateTo){
sql += `
AND DATE(invoice_date) <= ?
`;
params.push(dateTo);
}

sql += `
ORDER BY id DESC
`;

db.all(
sql,
params,
async(err,rows)=>{

if(err){
return res
.status(500)
.json(err);
}

sheet.columns = [

{
header:"Invoice",
key:"invoice_no",
width:20
},

{
header:"Date",
key:"invoice_date",
width:15
},

{
header:"Product",
key:"product_name",
width:30
},

{
header:"Qty",
key:"qty",
width:15
},

{
header:"Weight",
key:"weight",
width:15
},

{
header:"Unit Price",
key:"unit_price",
width:20
},

{
header:"Total Price",
key:"total_price",
width:20
},

{
header:"Supplier",
key:"supplier",
width:25
}

];

rows.forEach(row=>{
sheet.addRow(row);
});

res.setHeader(
"Content-Type",
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);

const fileName =
`Import_Report_${dateFrom || "ALL"}_to_${dateTo || "ALL"}.xlsx`;

res.setHeader(
"Content-Disposition",
`attachment; filename="${fileName}"`
);

await workbook.xlsx.write(res);

res.end();

}
);

}
);

/* =========================
EXPORT EXPORT EXCEL
========================= */

app.get(
"/export-excel/export",
async (req,res)=>{

const workbook =
new ExcelJS.Workbook();

const sheet =
workbook.addWorksheet(
"Export Report"
);

const dateFrom =
req.query.dateFrom;

const dateTo =
req.query.dateTo;

let sql = `
SELECT *
FROM exports
WHERE 1=1
`;

const params = [];

if(dateFrom){
sql += `
AND DATE(invoice_date) >= ?
`;
params.push(dateFrom);
}

if(dateTo){
sql += `
AND DATE(invoice_date) <= ?
`;
params.push(dateTo);
}

sql += `
ORDER BY id DESC
`;

db.all(
sql,
params,
async(err,rows)=>{

if(err){
return res
.status(500)
.json(err);
}

sheet.columns = [

{
header:"Invoice",
key:"invoice_no",
width:20
},

{
header:"Date",
key:"invoice_date",
width:15
},

{
header:"Product",
key:"product_name",
width:30
},

{
header:"Qty",
key:"qty",
width:15
},

{
header:"Weight",
key:"weight",
width:15
},

{
header:"Unit Price",
key:"unit_price",
width:20
},

{
header:"Total Price",
key:"total_price",
width:20
},

{
header:"Customer",
key:"customer",
width:25
}

];

rows.forEach(row=>{
sheet.addRow(row);
});

res.setHeader(
"Content-Type",
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);

const fileName =
`Export_Report_${dateFrom || "ALL"}_to_${dateTo || "ALL"}.xlsx`;

res.setHeader(
"Content-Disposition",
`attachment; filename="${fileName}"`
);

await workbook.xlsx.write(res);

res.end();

}
);

}
);
  /* =========================
  EXPORT SUPPLIER EXCEL
  ========================= */

  app.get(
  "/export-excel/supplier",
  async(req,res)=>{

  const workbook =
  new ExcelJS.Workbook();

  const sheet =
  workbook.addWorksheet(
  "Supplier Report"
  );

  db.all(

  `
  SELECT *
  FROM suppliers
  ORDER BY id DESC
  `,

  [],

  async(err,rows)=>{

  if(err){

  return res
  .status(500)
  .json(err);

  }

  sheet.columns = [

  {
  header:"Supplier",
  key:"supplier_name",
  width:30
  },

  {
  header:"Phone",
  key:"phone",
  width:20
  },

  {
  header:"Address",
  key:"address",
  width:40
  },

  {
  header:"Contact Person",
  key:"contact_person",
  width:25
  }

  ];

  rows.forEach(row=>{

  sheet.addRow(row);

  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
  "Content-Disposition",
  'attachment; filename="Supplier_Report.xlsx"'
  );

  await workbook.xlsx.write(res);

  res.end();

  }

  );

  }
  );
  /* =========================
  SYNC IMPORT
  ========================= */

  app.post(
  "/sync/imports",
  (req,res)=>{

  const rows = req.body || [];

  let inserted = 0;
  let skipped = 0;

  rows.forEach(item=>{

  db.get(

  `SELECT id
  FROM invoices
  WHERE invoice_no = ?
  LIMIT 1`,

  [item.invoice_no],

  (err,row)=>{

  if(row){

  skipped++;
  return;

  }

  db.run(

  `
  INSERT INTO invoices(

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  supplier,
  invoice_date

  )

  VALUES(
  ?,?,?,?,?,?,?,?,?,?
  )
  `,

  [
  item.invoice_no,
  item.product_name,

  item.qty,
  item.unit,

  item.unit_weight,
  item.weight,

  item.unit_price,
  item.total_price,

  item.supplier,
  item.invoice_date
  ],

  ()=>{

  inserted++;

  }

  );

  }

  );

  });

  setTimeout(()=>{

  res.json({

  success:true,
  inserted,
  skipped

  });

  },1000);

  }
  );

  /* =========================
  SYNC EXPORT
  ========================= */

  app.post(
  "/sync/exports",
  (req,res)=>{

  const rows = req.body || [];

  let inserted = 0;
  let skipped = 0;

  rows.forEach(item=>{

  db.get(

  `SELECT id
  FROM exports
  WHERE invoice_no = ?
  LIMIT 1`,

  [item.invoice_no],

  (err,row)=>{

  if(row){

  skipped++;
  return;

  }

  db.run(

  `
  INSERT INTO exports(

  invoice_no,
  product_name,

  qty,
  unit,

  unit_weight,
  weight,

  unit_price,
  total_price,

  customer,
  invoice_date

  )

  VALUES(
  ?,?,?,?,?,?,?,?,?,?
  )
  `,

  [
  item.invoice_no,
  item.product_name,

  item.qty,
  item.unit,

  item.unit_weight,
  item.weight,

  item.unit_price,
  item.total_price,

  item.customer,
  item.invoice_date
  ],

  ()=>{

  inserted++;

  }

  );

  }

  );

  });

  setTimeout(()=>{

  res.json({

  success:true,
  inserted,
  skipped

  });

  },1000);

  }
  );
  /* =========================
HEALTH CHECK
========================= */

app.get(
"/health",
(req,res)=>{

res.json({

success:true,
server:"running"

});

}
);

/* =========================
UPDATE IMPORT
========================= */

app.put(
  "/invoice/:id",
  uploadImport,
  (req, res) => {

    const {
      invoice_no,
      product_name,

      qty,
      unit,

      unit_weight,
      weight,

      unit_price,
      total_price,

      supplier,
      invoice_date,

      invoice_file,
      acdd_file,
      formd_file,
      truck_file,
      payment_file,
      fda_file,
      import_license_file

    } = req.body;

    db.run(

      `
      UPDATE invoices
      SET

      invoice_no=?,
      product_name=?,

      qty=?,
      unit=?,

      unit_weight=?,
      weight=?,

      unit_price=?,
      total_price=?,

      supplier=?,
      invoice_date=?,

      invoice_file=?,
      acdd_file=?,
      formd_file=?,
      truck_file=?,
      payment_file=?,
      fda_file=?,
      import_license_file=?

      WHERE id=?
      `,

      [

        invoice_no,
        product_name,

        qty,
        unit,

        unit_weight,
        weight,

        unit_price,
        total_price,

        supplier,
        invoice_date,

        req.files?.invoice_file?.[0]?.filename || invoice_file,
        req.files?.acdd_file?.[0]?.filename || acdd_file,
        req.files?.formd_file?.[0]?.filename || formd_file,
        req.files?.truck_file?.[0]?.filename || truck_file,
        req.files?.payment_file?.[0]?.filename || payment_file,
        req.files?.fda_file?.[0]?.filename || fda_file,
        req.files?.import_license_file?.[0]?.filename || import_license_file,

        req.params.id

      ],

      function (err) {

        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "ไม่พบข้อมูลที่ต้องการแก้ไข"
          });
        }

        res.json({
          success: true,
          message: "แก้ไขข้อมูลสำเร็จ",
          changes: this.changes
        });

      }

    );

  }
);
/* =========================
UPDATE EXPORT
========================= */

app.put(
  "/export/:id",
  uploadExport,
  (req,res)=>{

    const {

      invoice_no,
      product_name,

      qty,
      unit,

      unit_weight,
      weight,

      unit_price,
      total_price,

      customer,
      invoice_date,

      invoice_file,
      payment_file,
      formd_file,
      phytos_file,
      tax_file,
      export_license_file,
      origin_file,
      acdd_file

    } = req.body;

    db.run(

      `
      UPDATE exports
      SET

      invoice_no=?,
      product_name=?,

      qty=?,
      unit=?,

      unit_weight=?,
      weight=?,

      unit_price=?,
      total_price=?,

      customer=?,
      invoice_date=?,

      invoice_file=?,
      payment_file=?,
      formd_file=?,
      phytos_file=?,
      tax_file=?,
      export_license_file=?,
      origin_file=?,
      acdd_file=?

      WHERE id=?

      `,

      [

        invoice_no,
        product_name,

        qty,
        unit,

        unit_weight,
        weight,

        unit_price,
        total_price,

        customer,
        invoice_date,

        req.files?.invoice_file?.[0]?.filename || invoice_file,
        req.files?.payment_file?.[0]?.filename || payment_file,
        req.files?.formd_file?.[0]?.filename || formd_file,
        req.files?.phytos_file?.[0]?.filename || phytos_file,
        req.files?.tax_file?.[0]?.filename || tax_file,
        req.files?.export_license_file?.[0]?.filename || export_license_file,
        req.files?.origin_file?.[0]?.filename || origin_file,
        req.files?.acdd_file?.[0]?.filename || acdd_file,

        req.params.id

      ],

      function(err){

        if(err){

          return res.status(500).json({
            success:false,
            error:err.message
          });

        }

        if(this.changes===0){

          return res.status(404).json({
            success:false,
            message:"ไม่พบข้อมูลที่ต้องการแก้ไข"
          });

        }

        res.json({

          success:true,
          message:"แก้ไขข้อมูลสำเร็จ",
          changes:this.changes

        });

      }

    );

  }
);
/* =========================
EXPORT EXCEL SUMMARY
========================= */

app.get("/export-excel/summary", (req, res) => {

    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    let sql = `
    SELECT
        invoice_date AS date,
        SUM(total_import) AS totalImport,
        SUM(total_export) AS totalExport,
        SUM(total_export-total_import) AS balance
    FROM(

        SELECT
        invoice_date,
        total_price AS total_import,
        0 AS total_export
        FROM invoices

        UNION ALL

        SELECT
        invoice_date,
        0,
        total_price
        FROM exports

    )
    WHERE 1=1
    `;

    const params=[];

    if(dateFrom){

        sql += " AND DATE(invoice_date)>=?";
        params.push(dateFrom);

    }

    if(dateTo){

        sql += " AND DATE(invoice_date)<=?";
        params.push(dateTo);

    }

    sql += `
    GROUP BY invoice_date
    ORDER BY invoice_date
    `;

    db.all(sql,params,async(err,rows)=>{

        if(err)
            return res.status(500).json(err);

        const workbook=new ExcelJS.Workbook();

        const sheet=workbook.addWorksheet("Summary");

        sheet.columns=[

            {header:"Date",key:"date",width:20},
            {header:"Import",key:"totalImport",width:20},
            {header:"Export",key:"totalExport",width:20},
            {header:"Balance",key:"balance",width:20}

        ];

        rows.forEach(r=>sheet.addRow(r));

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="Summary.xlsx"'
        );

        await workbook.xlsx.write(res);

        res.end();

    });

});
/* =========================
START SERVER
========================= */

app.listen(
3002,
"0.0.0.0",
()=>{

console.log(
"================================="
);

console.log(
"Invoice Server Running : 3002"
);

console.log(
"http://localhost:3002"
);

console.log(
"================================="
);

}
);