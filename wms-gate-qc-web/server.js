import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
import path from 'path'
import ExcelJS from 'exceljs'

const app = express()

app.use(cors())
app.use(express.json())

const dbPath = path.resolve('./wms.db')

console.log('DB PATH =>', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {

  if (err) {

    console.log(err)

  } else {

    console.log('DATABASE CONNECTED')

  }

})

db.serialize(() => {

  db.run(`

    CREATE TABLE IF NOT EXISTS gate_in (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      plate TEXT,

      driver TEXT,

      weight TEXT,

      product TEXT,

      status TEXT,

      weight_out TEXT,

      net_weight TEXT,

      out_time TEXT,

      time TEXT

    )

  `)

})

app.get('/', (req, res) => {

  res.send('SERVER RUNNING')

})

/* =========================
   GATE IN
========================= */

app.post('/gate-in', (req, res) => {

  const {
    plate,
    driver,
    weight,
    product
  } = req.body

  const status = 'IN'

  const time =
    new Date().toLocaleString()

  db.run(

    `
      INSERT INTO gate_in (

        plate,
        driver,
        weight,
        product,
        status,
        weight_out,
        net_weight,
        out_time,
        time

      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,

    [
      plate,
      driver,
      weight,
      product,
      status,
      '',
      '',
      '',
      time
    ],

    function (err) {

      if (err) {

        return res.status(500).json({
          error: err.message
        })

      }

      res.json({
        success: true,
        id: this.lastID
      })

    }

  )

})

/* =========================
   GET ALL
========================= */

app.get('/gate-in', (req, res) => {

  db.all(

    `
      SELECT *
      FROM gate_in
      ORDER BY id DESC
    `,

    [],

    (err, rows) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        })

      }

      res.json(rows)

    }

  )

})

/* =========================
   GATE OUT
========================= */

app.put('/gate-out/:id', (req, res) => {

  const id = req.params.id

  const {
    weight_out,
    net_weight
  } = req.body

  const out_time =
    new Date().toLocaleString()

  db.run(

    `
      UPDATE gate_in

      SET

        status='OUT',

        weight_out=?,

        net_weight=?,

        out_time=?

      WHERE id=?
    `,

    [
      weight_out,
      net_weight,
      out_time,
      id
    ],

    function (err) {

      if (err) {

        return res.status(500).json({
          error: err.message
        })

      }

      res.json({
        success: true
      })

    }

  )

})

/* =========================
   DASHBOARD
========================= */

app.get('/dashboard', (req, res) => {

  db.all(

    `
      SELECT *
      FROM gate_in
    `,

    [],

    (err, rows) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        })

      }

      const truckIn =
        rows.filter(
          x => x.status === 'IN'
        ).length

      const truckOut =
        rows.filter(
          x => x.status === 'OUT'
        ).length

      const totalTrips =
        rows.length

      const totalNetWeight =
        rows.reduce(

          (sum, item) =>

            sum +
            Number(
              item.net_weight || 0
            ),

          0

        )

      res.json({

        truckIn,
        truckOut,
        totalTrips,
        totalNetWeight

      })

    }

  )

})

/* =========================
   SEARCH
========================= */

app.get('/search', (req, res) => {

  const keyword =
    req.query.keyword || ''

  db.all(

    `
      SELECT *
      FROM gate_in

      WHERE

        plate LIKE ?

        OR driver LIKE ?

        OR product LIKE ?

      ORDER BY id DESC
    `,

    [

      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`

    ],

    (err, rows) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        })

      }

      res.json(rows)

    }

  )

})

/* =========================
   EXPORT EXCEL
========================= */

app.get('/export-excel', async (req,res)=>{

  const from = req.query.from
  const to = req.query.to

  const workbook =
    new ExcelJS.Workbook()

  const worksheet =
    workbook.addWorksheet(
      'WMS Report'
    )

  worksheet.columns = [

    { header:'ID', key:'id', width:10 },
    { header:'Plate', key:'plate', width:20 },
    { header:'Driver', key:'driver', width:20 },
    { header:'Product', key:'product', width:20 },
    { header:'Weight In', key:'weight', width:15 },
    { header:'Weight Out', key:'weight_out', width:15 },
    { header:'Net Weight', key:'net_weight', width:15 },
    { header:'Status', key:'status', width:15 },
    { header:'Time In', key:'time', width:25 },
    { header:'Time Out', key:'out_time', width:25 }

  ]

  db.all(

    `
    SELECT *
    FROM gate_in
    ORDER BY id DESC
    `,

    [],

    async (err,rows)=>{

      if(err){

        return res.status(500).json({
          error:err.message
        })

      }

      const filtered = rows.filter(item=>{

        if(!from || !to)
          return true

        const rowDate =
          new Date(item.time)

        return (

          rowDate >= new Date(from)

          &&

          rowDate <= new Date(to + ' 23:59:59')

        )

      })

      filtered.forEach(row=>{

        worksheet.addRow(row)

      })

      res.setHeader(

        'Content-Type',

        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

      )

      res.setHeader(

        'Content-Disposition',

        'attachment; filename=wms-report.xlsx'

      )

      await workbook.xlsx.write(res)

      res.end()

    }

  )

})
/* =========================
   STOCK
========================= */

app.get('/stock', (req, res) => {

  db.all(

    `
      SELECT

        product,

        SUM(
          CAST(net_weight AS REAL)
        ) AS stock

      FROM gate_in

      WHERE status='OUT'

      GROUP BY product

      ORDER BY product
    `,

    [],

    (err, rows) => {

      if (err) {

        return res.status(500).json({
          error: err.message
        })

      }

      res.json(rows)

    }

  )

})

/* =========================
   SYNC
========================= */

app.post('/sync-data', (req, res) => {

  const rows = req.body

  if (!Array.isArray(rows)) {

    return res.status(400).json({
      error:'Invalid Data'
    })

  }

  rows.forEach(item => {

    db.run(

      `
      INSERT OR IGNORE INTO gate_in (

        id,
        plate,
        driver,
        weight,
        product,
        status,
        weight_out,
        net_weight,
        out_time,
        time

      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,

      [

        item.id,
        item.plate,
        item.driver,
        item.weight,
        item.product,
        item.status,
        item.weight_out,
        item.net_weight,
        item.out_time,
        item.time

      ]

    )

  })

  res.json({
    success:true
  })

})

app.listen(3001, () => {

  console.log(
    'SERVER START http://localhost:3001'
  )

})