import {
  useEffect,
  useState
} from "react";


// =====================================================
// API URL
//
// URL หลักของ Backend
// =====================================================

const API =
  "http://localhost:3002/api";


// =====================================================
// BUILD AUTH HEADERS
//
// Function นี้อยู่นอก Component
//
// ข้อดี:
// - ไม่ถูกสร้างใหม่ทุก Render 
// - useEffect ไม่ต้องใส่ Function ลง Dependency
// - แก้ Warning react-hooks/exhaustive-deps
//
// Input:
// token
//
// Output:
//
// {
//   Authorization: "Bearer TOKEN"
// }
// =====================================================

function buildAuthHeaders(
  token
) {

  if (
    !token
  ) {

    return {};

  }


  return {

    Authorization:
      `Bearer ${token}`

  };

}


// =====================================================
// BUILD DATE QUERY
//
// Function นี้อยู่นอก Component
//
// จึงไม่ทำให้เกิด Warning:
//
// react-hooks/exhaustive-deps
//
// ตัวอย่าง:
//
// buildDateQuery(
//   "2026-08-01",
//   "2026-08-31",
//   {
//     page: 1
//   }
// )
//
// Result:
//
// dateFrom=2026-08-01&dateTo=2026-08-31&page=1
// =====================================================

function buildDateQuery(
  dateFrom,
  dateTo,
  extra = {}
) {

  const params =
    new URLSearchParams();


  // ---------------------------------------------------
  // DATE FROM
  // ---------------------------------------------------

  if (
    dateFrom
  ) {

    params.set(
      "dateFrom",
      dateFrom
    );

  }


  // ---------------------------------------------------
  // DATE TO
  // ---------------------------------------------------

  if (
    dateTo
  ) {

    params.set(
      "dateTo",
      dateTo
    );

  }


  // ---------------------------------------------------
  // EXTRA QUERY
  //
  // เช่น:
  //
  // page
  // limit
  // keyword
  // ---------------------------------------------------

  Object.entries(
    extra
  ).forEach(
    (
      [
        key,
        value
      ]
    ) => {

      if (
        value !==
        undefined
        &&
        value !==
        null
        &&
        value !==
        ""
      ) {

        params.set(
          key,
          String(
            value
          )
        );

      }

    }
  );


  return params.toString();

}


// =====================================================
// NUMBER FORMAT
//
// Function นี้อยู่นอก Component
//
// ใช้แสดง:
//
// Qty
// Unit Price
// Total Price
// Stock
// =====================================================

function formatNumberDisplay(
  value,
  maxDecimal = 2
) {

  const num =
    Number(

      String(
        value ?? ""
      )
        .replace(
          /,/g,
          ""
        )

    );


  if (
    !Number.isFinite(
      num
    )
  ) {

    return "-";

  }


  return num.toLocaleString(
    "en-US",
    {

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        maxDecimal

    }
  );

}


// =====================================================
// CALCULATE PROGRESS
//
// จำกัดค่าให้อยู่ระหว่าง:
//
// 0 - 100
//
// ป้องกัน Progress Bar ล้น
// =====================================================

function getProgressWidth(
  value,
  total
) {

  const current =
    Number(
      value || 0
    );


  const maximum =
    Number(
      total || 0
    );


  if (
    !Number.isFinite(
      current
    )
    ||
    !Number.isFinite(
      maximum
    )
    ||
    maximum <= 0
  ) {

    return 0;

  }


  const percent =
    (
      current /
      maximum
    ) *
    100;


  return Math.max(
    0,
    Math.min(
      100,
      percent
    )
  );

}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {


  // =====================================================
  // AUTH TOKEN
  //
  // อ่าน JWT Token จาก localStorage
  //
  // Backend ที่ใช้:
  //
  // authenticate
  //
  // ต้องส่ง:
  //
  // Authorization: Bearer TOKEN
  // =====================================================

  const token =
    localStorage.getItem(
      "token"
    );


  // =====================================================
  // TODAY
  //
  // ใช้เป็น Default Date
  // =====================================================

  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );


  // =====================================================
  // DATE FILTER STATE
  // =====================================================

  const [
    dateFrom,
    setDateFrom
  ] =
    useState(
      today
    );


  const [
    dateTo,
    setDateTo
  ] =
    useState(
      today
    );


  // =====================================================
  // SEARCH KEYWORD
  // =====================================================

  const [
    keyword,
    setKeyword
  ] =
    useState(
      ""
    );


  // =====================================================
  // PAGINATION STATE
  // =====================================================

  const [
    importPage,
    setImportPage
  ] =
    useState(
      1
    );


  const [
    exportPage,
    setExportPage
  ] =
    useState(
      1
    );


  const [
    importPages,
    setImportPages
  ] =
    useState(
      1
    );


  const [
    exportPages,
    setExportPages
  ] =
    useState(
      1
    );


  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const [
    summary,
    setSummary
  ] =
    useState(
      {}
    );


  const [
    recentImport,
    setRecentImport
  ] =
    useState(
      []
    );


  const [
    recentExport,
    setRecentExport
  ] =
    useState(
      []
    );


  // =====================================================
  // DASHBOARD SUMMARY
  //
  // GET:
  //
  // /api/dashboard
  //
  // Dependency:
  //
  // dateFrom
  // dateTo
  // token
  //
  // ไม่มี Warning เพราะ:
  //
  // buildDateQuery()
  // buildAuthHeaders()
  //
  // เป็น Function ภายนอก Component
  // =====================================================

  useEffect(
    () => {

      async function loadDashboard() {

        try {

          const query =
            buildDateQuery(
              dateFrom,
              dateTo
            );


          const url =
            `${API}/dashboard` +
            (
              query
                ? `?${query}`
                : ""
            );


          const res =
            await fetch(
              url,
              {

                method:
                  "GET",

                headers:
                  buildAuthHeaders(
                    token
                  )

              }
            );


          // -----------------------------------------------
          // HTTP ERROR
          // -----------------------------------------------

          if (
            !res.ok
          ) {

            if (
              res.status ===
              401
            ) {

              throw new Error(
                "Unauthorized. Please login again."
              );

            }


            if (
              res.status ===
              403
            ) {

              throw new Error(
                "You do not have permission to view Dashboard."
              );

            }


            throw new Error(
              `Dashboard HTTP ${res.status}`
            );

          }


          const data =
            await res.json();


          // -----------------------------------------------
          // รองรับทั้ง:
          //
          // { data: {} }
          //
          // และ:
          //
          // {}
          // -----------------------------------------------

          setSummary(
            data?.data ||
            data ||
            {}
          );


        } catch (
          err
        ) {

          console.error(
            "Dashboard error:",
            err
          );


          setSummary(
            {}
          );

        }

      }


      loadDashboard();

    },
    [

      dateFrom,

      dateTo,

      token

    ]
  );


  // =====================================================
  // RECENT IMPORT
  //
  // GET:
  //
  // /api/dashboard/recent-import
  //
  // Query:
  //
  // page
  // dateFrom
  // dateTo
  // =====================================================

  useEffect(
    () => {

      async function loadRecentImport() {

        try {

          const query =
            buildDateQuery(
              dateFrom,
              dateTo,
              {

                page:
                  importPage

              }
            );


          const url =
            `${API}/dashboard/recent-import` +
            (
              query
                ? `?${query}`
                : ""
            );


          const res =
            await fetch(
              url,
              {

                method:
                  "GET",

                headers:
                  buildAuthHeaders(
                    token
                  )

              }
            );


          if (
            !res.ok
          ) {

            throw new Error(
              `Recent Import HTTP ${res.status}`
            );

          }


          const data =
            await res.json();


          console.log(
            "IMPORT",
            data
          );


          setRecentImport(

            Array.isArray(
              data
            )

              ? data

              : Array.isArray(
                  data?.data
                )

                ? data.data

                : []

          );


        } catch (
          err
        ) {

          console.error(
            "Recent import error:",
            err
          );


          setRecentImport(
            []
          );

        }

      }


      loadRecentImport();

    },
    [

      importPage,

      dateFrom,

      dateTo,

      token

    ]
  );


  // =====================================================
  // RECENT EXPORT
  //
  // GET:
  //
  // /api/dashboard/recent-export
  //
  // Query:
  //
  // page
  // dateFrom
  // dateTo
  // =====================================================

  useEffect(
    () => {

      async function loadRecentExport() {

        try {

          const query =
            buildDateQuery(
              dateFrom,
              dateTo,
              {

                page:
                  exportPage

              }
            );


          const url =
            `${API}/dashboard/recent-export` +
            (
              query
                ? `?${query}`
                : ""
            );


          const res =
            await fetch(
              url,
              {

                method:
                  "GET",

                headers:
                  buildAuthHeaders(
                    token
                  )

              }
            );


          if (
            !res.ok
          ) {

            throw new Error(
              `Recent Export HTTP ${res.status}`
            );

          }


          const data =
            await res.json();


          console.log(
            "EXPORT",
            data
          );


          setRecentExport(

            Array.isArray(
              data
            )

              ? data

              : Array.isArray(
                  data?.data
                )

                ? data.data

                : []

          );


        } catch (
          err
        ) {

          console.error(
            "Recent export error:",
            err
          );


          setRecentExport(
            []
          );

        }

      }


      loadRecentExport();

    },
    [

      exportPage,

      dateFrom,

      dateTo,

      token

    ]
  );


  // =====================================================
  // PAGINATION
  //
  // GET:
  //
  // /api/dashboard/import-pages
  //
  // /api/dashboard/export-pages
  //
  // เมื่อ Date เปลี่ยน:
  //
  // 1. กลับไปหน้า 1
  // 2. โหลดจำนวนหน้าใหม่
  // =====================================================

  useEffect(
    () => {

      async function loadPages() {

        // -----------------------------------------------
        // Reset Current Page
        // -----------------------------------------------

        setImportPage(
          1
        );


        setExportPage(
          1
        );


        // -----------------------------------------------
        // IMPORT PAGE COUNT
        // -----------------------------------------------

        try {

          const query =
            buildDateQuery(
              dateFrom,
              dateTo
            );


          const url =
            `${API}/dashboard/import-pages` +
            (
              query
                ? `?${query}`
                : ""
            );


          const resImp =
            await fetch(
              url,
              {

                method:
                  "GET",

                headers:
                  buildAuthHeaders(
                    token
                  )

              }
            );


          if (
            !resImp.ok
          ) {

            throw new Error(
              `Import Pages HTTP ${resImp.status}`
            );

          }


          const impData =
            await resImp.json();


          setImportPages(

            Math.max(

              1,

              Number(
                impData?.pages ||
                impData?.data?.pages ||
                1
              )

            )

          );


        } catch (
          err
        ) {

          console.error(
            "Import pages error:",
            err
          );


          setImportPages(
            1
          );

        }


        // -----------------------------------------------
        // EXPORT PAGE COUNT
        // -----------------------------------------------

        try {

          const query =
            buildDateQuery(
              dateFrom,
              dateTo
            );


          const url =
            `${API}/dashboard/export-pages` +
            (
              query
                ? `?${query}`
                : ""
            );


          const resExp =
            await fetch(
              url,
              {

                method:
                  "GET",

                headers:
                  buildAuthHeaders(
                    token
                  )

              }
            );


          if (
            !resExp.ok
          ) {

            throw new Error(
              `Export Pages HTTP ${resExp.status}`
            );

          }


          const expData =
            await resExp.json();


          setExportPages(

            Math.max(

              1,

              Number(
                expData?.pages ||
                expData?.data?.pages ||
                1
              )

            )

          );


        } catch (
          err
        ) {

          console.error(
            "Export pages error:",
            err
          );


          setExportPages(
            1
          );

        }

      }


      loadPages();

    },
    [

      dateFrom,

      dateTo,

      token

    ]
  );


  // =====================================================
  // EXCEL EXPORT
  //
  // Backend:
  //
  // /api/reports/export-excel/:type
  //
  // ใช้ fetch()
  //
  // เพราะ:
  //
  // window.location.href
  //
  // ไม่สามารถส่ง Bearer Token ได้
  //
  // Flow:
  //
  // fetch()
  // ↓
  // Authorization
  // ↓
  // Blob
  // ↓
  // Create Object URL
  // ↓
  // Download
  // =====================================================

  const downloadExcel =
    async (
      type
    ) => {

      const allowedTypes =
        [

          "stock",

          "movement",

          "import",

          "export",

          "supplier",

          "summary"

        ];


      // -----------------------------------------------
      // Validate Type
      // -----------------------------------------------

      if (
        !allowedTypes.includes(
          type
        )
      ) {

        console.error(
          "Invalid Excel report type:",
          type
        );


        alert(
          "ປະເພດ Report ບໍ່ຖືກຕ້ອງ"
        );

        return;

      }


      // -----------------------------------------------
      // Validate Token
      // -----------------------------------------------

      if (
        !token
      ) {

        alert(
          "ກະລຸນາ Login ໃໝ່"
        );

        return;

      }


      try {

        const query =
          buildDateQuery(
            dateFrom,
            dateTo
          );


        const url =
          `${API}/reports/export-excel/${type}` +
          (
            query
              ? `?${query}`
              : ""
          );


        console.log(
          "Download Excel:",
          url
        );


        const response =
          await fetch(
            url,
            {

              method:
                "GET",

              headers:
                buildAuthHeaders(
                  token
                )

            }
          );


        // -----------------------------------------------
        // HTTP ERROR
        // -----------------------------------------------

        if (
          !response.ok
        ) {

          let message =
            `Download failed: ${response.status}`;


          try {

            const errorData =
              await response.json();


            message =
              errorData?.message ||
              errorData?.error ||
              message;

          } catch (
            error
          ) {

            console.error(
              "Cannot parse Excel error:",
              error
            );

          }


          throw new Error(
            message
          );

        }


        // -----------------------------------------------
        // GET FILE BLOB
        // -----------------------------------------------

        const blob =
          await response.blob();


        if (
          !blob ||
          blob.size === 0
        ) {

          throw new Error(
            "Excel file is empty"
          );

        }


        // -----------------------------------------------
        // FILE NAME
        //
        // พยายามใช้ชื่อจาก Backend
        //
        // ถ้าไม่มีใช้:
        //
        // type-report.xlsx
        // -----------------------------------------------

        const contentDisposition =
          response.headers.get(
            "content-disposition"
          );


        let fileName =
          `${type}-report.xlsx`;


        if (
          contentDisposition
        ) {

          const match =
            contentDisposition.match(
              /filename\*?=(?:UTF-8''|")?([^";\n]+)/i
            );


          if (
            match &&
            match[1]
          ) {

            fileName =
              decodeURIComponent(
                match[1]
                  .replace(
                    /"/g,
                    ""
                  )
                  .trim()
              );

          }

        }


        // -----------------------------------------------
        // CREATE TEMPORARY DOWNLOAD URL
        // -----------------------------------------------

        const objectUrl =
          window.URL.createObjectURL(
            blob
          );


        const link =
          document.createElement(
            "a"
          );


        link.href =
          objectUrl;


        link.download =
          fileName;


        document.body.appendChild(
          link
        );


        link.click();


        link.remove();


        // -----------------------------------------------
        // RELEASE MEMORY
        // -----------------------------------------------

        window.setTimeout(
          () => {

            window.URL.revokeObjectURL(
              objectUrl
            );

          },
          1000
        );


      } catch (
        err
      ) {

        console.error(
          "Excel download error:",
          err
        );


        alert(
          "ດາວໂຫຼດ Excel ບໍ່ສຳເລັດ: " +
          (
            err?.message ||
            "Unknown error"
          )
        );

      }

    };


  // =====================================================
  // SEARCH
  // =====================================================

  const searchText =
    keyword
      .trim()
      .toLowerCase();


  const importFiltered =
    recentImport.filter(
      (
        item
      ) => {

        const text =
          `${
            item.invoice_no ||
            ""
          } ${
            item.product_name ||
            ""
          }`
            .toLowerCase();


        return text.includes(
          searchText
        );

      }
    );


  const exportFiltered =
    recentExport.filter(
      (
        item
      ) => {

        const text =
          `${
            item.invoice_no ||
            ""
          } ${
            item.product_name ||
            ""
          }`
            .toLowerCase();


        return text.includes(
          searchText
        );

      }
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="dashboard-container"
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="dashboard-header"
      >

        <div>

          <h1
            className="dashboard-title"
          >
            📊 Warehouse Dashboard
          </h1>


          <p
            className="dashboard-subtitle"
          >
            Inventory Management System
          </p>

        </div>


        <div
          className="dashboard-filter"
        >

          <input
            type="text"
            placeholder="🔍 Search Invoice / Product"
            value={
              keyword
            }
            onChange={(e) =>
              setKeyword(
                e.target.value
              )
            }
            className="search-input"
          />


          <div
            className="date-range-group"
          >

            <div
              className="date-input-wrapper"
              onClick={(e) => {

                const input =
                  e.currentTarget.querySelector(
                    "input"
                  );


                if (
                  input &&
                  typeof input.showPicker ===
                  "function"
                ) {

                  input.showPicker();

                } else if (
                  input
                ) {

                  input.focus();

                }

              }}
            >

              <input
                id="date-from"
                type="date"
                value={
                  dateFrom
                }
                onChange={(e) =>
                  setDateFrom(
                    e.target.value
                  )
                }
                className="date-input"
              />

            </div>


            <span
              className="date-separator"
            >
              →
            </span>


            <div
              className="date-input-wrapper"
              onClick={(e) => {

                const input =
                  e.currentTarget.querySelector(
                    "input"
                  );


                if (
                  input &&
                  typeof input.showPicker ===
                  "function"
                ) {

                  input.showPicker();

                } else if (
                  input
                ) {

                  input.focus();

                }

              }}
            >

              <input
                id="date-to"
                type="date"
                value={
                  dateTo
                }
                onChange={(e) =>
                  setDateTo(
                    e.target.value
                  )
                }
                className="date-input"
              />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="summary-grid">

  {/* 1. TOTAL IMPORT */}
  <div className="summary-card blue">
    <div className="card-icon">📥</div>
    <div className="card-info">
      <span>Total Import</span>
      <h2>
        {Number(
          summary.totalImport || 0
        ).toLocaleString()}
      </h2>
    </div>
  </div>

  {/* 2. TOTAL EXPORT */}
  <div className="summary-card purple">
    <div className="card-icon">📤</div>
    <div className="card-info">
      <span>Total Export</span>
      <h2>
        {Number(
          summary.totalExport || 0
        ).toLocaleString()}
      </h2>
    </div>
  </div>

  {/* 3. CURRENT STOCK */}
  <div className="summary-card green">
    <div className="card-icon">📦</div>
    <div className="card-info">
      <span>Current Stock</span>
      <h2>
        {formatNumberDisplay(
          summary.totalStockQty
        )}
      </h2>
    </div>
  </div>

  {/* 4. TOTAL WEIGHT */}
  <div className="summary-card">
    <div className="card-icon">⚖️</div>
    <div className="card-info">
      <span>Total Weight</span>
      <h2>
        {formatNumberDisplay(
          summary.totalWeight
        )}
      </h2>
    </div>
  </div>

    {/* =================================================
      5. IMPORT VALUE
      ================================================= */}

  <div className="summary-card">
    <div className="card-icon">
      💰
    </div>

    <div className="card-info">

      <span>
        Import Value
      </span>

      <h2>

        {formatNumberDisplay(
          summary.importAmount
        )}

      </h2>

    </div>
  </div>


  {/* =================================================
      6. EXPORT VALUE
      ================================================= */}

  <div className="summary-card">
    <div className="card-icon">
      💵
    </div>

    <div className="card-info">

      <span>
        Export Value
      </span>

      <h2>

        {formatNumberDisplay(
          summary.exportAmount
        )}

      </h2>

    </div>
  </div>


  {/* =================================================
      7. BALANCE VALUE
      ================================================= */}

  <div className="summary-card">
    <div className="card-icon">
      📈
    </div>

    <div className="card-info">

      <span>
        Balance Value
      </span>

      <h2>

        {formatNumberDisplay(
          summary.balanceValue
        )}

      </h2>

    </div>
  </div>
  {/* 8. SUPPLIERS */}
  <div className="summary-card orange">
    <div className="card-icon">🏪</div>
    <div className="card-info">
      <span>Suppliers</span>
      <h2>
        {Number(
          summary.supplierCount || 0
        ).toLocaleString()}
      </h2>
    </div>
  </div>

  {/* 9. USERS */}
  <div className="summary-card red">
    <div className="card-icon">👤</div>
    <div className="card-info">
      <span>Users</span>
      <h2>
        {Number(
          summary.userCount || 0
        ).toLocaleString()}
      </h2>
    </div>
  </div>

</div>


      {/* =================================================
          INVENTORY MOVEMENT
      ================================================= */}

      <div
        className="panel"
      >

        <h3>
          📈 Inventory Movement
        </h3>


        <div
          className="progress-row"
        >

          <span>
            Import Qty
          </span>


          <div
            className="progress"
          >

            <div
              className="progress-fill import-fill"
              style={{
                width:
                  "100%"
              }}
            />

          </div>


          <strong>

            {
              formatNumberDisplay(
                summary.importQty
              )
            }

          </strong>

        </div>


        <div
          className="progress-row"
        >

          <span>
            Export Qty
          </span>


          <div
            className="progress"
          >

            <div
              className="progress-fill export-fill"
              style={{
                width:
                  `${
                    getProgressWidth(
                      summary.exportQty,
                      summary.importQty
                    )
                  }%`
              }}
            />

          </div>


          <strong>

            {
              formatNumberDisplay(
                summary.exportQty
              )
            }

          </strong>

        </div>


        <div
          className="progress-row"
        >

          <span>
            Remaining
          </span>


          <div
            className="progress"
          >

            <div
              className="progress-fill stock-fill"
              style={{
                width:
                  `${
                    getProgressWidth(
                      summary.stockQty,
                      summary.importQty
                    )
                  }%`
              }}
            />

          </div>


          <strong>

            {
              formatNumberDisplay(
                summary.stockQty
              )
            }

          </strong>

        </div>

      </div>


      {/* =================================================
          RECENT IMPORT + EXPORT
      ================================================= */}

      <div
        className="recent-grid"
      >


        {/* ===============================================
            RECENT IMPORT
        =============================================== */}

        <div
          className="panel"
        >

          <div
            className="panel-header"
          >

            <h3>
              📥 Recent Import
            </h3>

          </div>


          <table
            className="modern-table"
          >

            <thead>

              <tr>

                <th>
                  Invoice
                </th>

                <th>
                  Product
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Unit Price
                </th>

                <th>
                  Total Price
                </th>

                <th>
                  Files
                </th>

              </tr>

            </thead>


            <tbody
              className="recent-body"
            >

              {
                importFiltered.length ===
                0

                  ? (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center"
                        }}
                      >
                        No Import Data
                      </td>

                    </tr>

                  )

                  : (

                    importFiltered.map(
                      (
                        item
                      ) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            {item.invoice_no}
                          </td>


                          <td>
                            {item.product_name}
                          </td>


                          <td>

                            {
                              formatNumberDisplay(
                                item.qty
                              )
                            }

                          </td>


                          <td>

                            {
                              formatNumberDisplay(
                                item.unit_price
                              )
                            }

                          </td>


                          <td>

                            {
                              formatNumberDisplay(
                                item.total_price
                              )
                            }

                          </td>


                          <td>

                            <details>

                              <summary>
                                📎 Files
                              </summary>


                              {
                                item.invoice_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.invoice_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Invoice
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.acdd_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.acdd_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      ACDD
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.formd_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.formd_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      FORM D
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.truck_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.truck_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Truck
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.payment_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.payment_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Payment
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.fda_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.fda_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      FDA
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.import_license_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.import_license_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Import License
                                    </a>

                                  </div>

                                )
                              }


                              {
                                !item.invoice_file &&
                                !item.acdd_file &&
                                !item.formd_file &&
                                !item.truck_file &&
                                !item.payment_file &&
                                !item.fda_file &&
                                !item.import_license_file && (

                                  <div>
                                    No files
                                  </div>

                                )
                              }

                            </details>

                          </td>

                        </tr>

                      )
                    )

                  )
              }

            </tbody>

          </table>


          {/* IMPORT PAGINATION */}

          <div
            className="pagination"
          >

            <button
              type="button"
              disabled={
                importPage <=
                1
              }
              onClick={() =>
                setImportPage(
                  (
                    current
                  ) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
            >
              ◀
            </button>


            {
              Array.from({

                length:
                  importPages

              }).map(
                (
                  _,
                  i
                ) => (

                  <button
                    type="button"
                    key={
                      i
                    }
                    className={
                      importPage ===
                      i + 1
                        ? "active-page"
                        : ""
                    }
                    onClick={() =>
                      setImportPage(
                        i + 1
                      )
                    }
                  >
                    {i + 1}
                  </button>

                )
              )
            }


            <button
              type="button"
              disabled={
                importPage >=
                importPages
              }
              onClick={() =>
                setImportPage(
                  (
                    current
                  ) =>
                    Math.min(
                      importPages,
                      current + 1
                    )
                )
              }
            >
              ▶
            </button>

          </div>

        </div>


        {/* ===============================================
            RECENT EXPORT
        =============================================== */}

        <div
          className="panel"
        >

          <div
            className="panel-header"
          >

            <h3>
              📤 Recent Export
            </h3>

          </div>


          <table
            className="modern-table"
          >

            <thead>

              <tr>

                <th>
                  Invoice
                </th>

                <th>
                  Product
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Unit Price
                </th>

                <th>
                  Total Price
                </th>

                <th>
                  Files
                </th>

              </tr>

            </thead>


            <tbody
              className="recent-body"
            >

              {
                exportFiltered.length ===
                0

                  ? (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center"
                        }}
                      >
                        No Export Data
                      </td>

                    </tr>

                  )

                  : (

                    exportFiltered.map(
                      (
                        item
                      ) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            {item.invoice_no}
                          </td>


                          <td>
                            {item.product_name}
                          </td>


                          <td>

                            {
                              formatNumberDisplay(
                                item.qty
                              )
                            }

                          </td>


                          <td>

                            {
                              formatNumberDisplay(
                                item.unit_price
                              )
                            }

                          </td>


                          <td>

                            {
                              formatNumberDisplay(
                                item.total_price
                              )
                            }

                          </td>


                          <td>

                            <details>

                              <summary>
                                📎 Files
                              </summary>


                              {
                                item.invoice_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.invoice_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Invoice
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.payment_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.payment_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Payment
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.formd_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.formd_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      FORM D
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.phytos_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.phytos_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      PHYTOS
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.tax_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.tax_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Tax
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.export_license_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.export_license_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Export License
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.origin_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.origin_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Origin
                                    </a>

                                  </div>

                                )
                              }


                              {
                                item.acdd_file && (

                                  <div>

                                    <a
                                      href={
                                        `http://localhost:3002/uploads/${item.acdd_file}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      ACDD
                                    </a>

                                  </div>

                                )
                              }


                              {
                                !item.invoice_file &&
                                !item.payment_file &&
                                !item.formd_file &&
                                !item.phytos_file &&
                                !item.tax_file &&
                                !item.export_license_file &&
                                !item.origin_file &&
                                !item.acdd_file && (

                                  <div>
                                    No files
                                  </div>

                                )
                              }

                            </details>

                          </td>

                        </tr>

                      )
                    )

                  )
              }

            </tbody>

          </table>


          {/* EXPORT PAGINATION */}

          <div
            className="pagination"
          >

            <button
              type="button"
              disabled={
                exportPage <=
                1
              }
              onClick={() =>
                setExportPage(
                  (
                    current
                  ) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
            >
              ◀
            </button>


            {
              Array.from({

                length:
                  exportPages

              }).map(
                (
                  _,
                  i
                ) => (

                  <button
                    type="button"
                    key={
                      i
                    }
                    className={
                      exportPage ===
                      i + 1
                        ? "active-page"
                        : ""
                    }
                    onClick={() =>
                      setExportPage(
                        i + 1
                      )
                    }
                  >
                    {i + 1}
                  </button>

                )
              )
            }


            <button
              type="button"
              disabled={
                exportPage >=
                exportPages
              }
              onClick={() =>
                setExportPage(
                  (
                    current
                  ) =>
                    Math.min(
                      exportPages,
                      current + 1
                    )
                )
              }
            >
              ▶
            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          EXPORT CENTER
      ================================================= */}

      <div
        className="panel"
      >

        <h3>
          📑 Export Center
        </h3>


        <p
          style={{

            marginTop:
              "5px",

            color:
              "#666"

          }}
        >

          {
            dateFrom ||
            dateTo

              ? `ช่วงวันที่ ${
                  dateFrom ||
                  "-"
                } ถึง ${
                  dateTo ||
                  "-"
                }`

              : "Export ข้อมูลทั้งหมด"
          }

        </p>


        <div
          className="export-grid"
        >

          <button
            type="button"
            onClick={() =>
              downloadExcel(
                "stock"
              )
            }
          >
            📦 Stock Report
          </button>


          <button
            type="button"
            onClick={() =>
              downloadExcel(
                "import"
              )
            }
          >
            📥 Import Report
          </button>


          <button
            type="button"
            onClick={() =>
              downloadExcel(
                "export"
              )
            }
          >
            📤 Export Report
          </button>


          <button
            type="button"
            onClick={() =>
              downloadExcel(
                "supplier"
              )
            }
          >
            🏪 Supplier Report
          </button>


          <button
            type="button"
            onClick={() =>
              downloadExcel(
                "summary"
              )
            }
          >
            📊 Summary Report
          </button>

        </div>

      </div>

    </div>

  );

}


export default Dashboard;