import {
  useEffect,
  useState,
  useCallback
} from "react";


function ExportInvoice() {

  // =====================================================
  // API
  // =====================================================

  const API = "http://localhost:3002";


  // =====================================================
  // STATE
  // =====================================================

  const [list, setList] = useState([]);

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [editId, setEditId] = useState(null);

  const [docType, setDocType] =
    useState("invoice_file");

  const [files, setFiles] = useState({});

  const [oldFiles, setOldFiles] =
    useState({});

  const [suppliers, setSuppliers] =
    useState([]);

  const [showSupplierList, setShowSupplierList] =
    useState(false);

  const [showProductList, setShowProductList] =
    useState(false);

  const [invoiceSearch, setInvoiceSearch] =
    useState("");


  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({

    invoice_no: "",

    product_code: "",

    product_name: "",

    qty: "",

    unit: "",

    unit_weight: "",

    weight: "",

    unit_price: "",

    total_price: "",

    supplier: "",

    invoice_date: ""

  });


  // =====================================================
  // LOAD EXPORT
  // =====================================================

  const loadData = useCallback(
    async () => {

      try {

        const res = await fetch(
          `${API}/api/exports`
        );

        const result = await res.json();


        if (result.success) {

          setList(
            result.data || []
          );

        } else {

          setList([]);

        }

      } catch (err) {

        console.error(
          "Load export error:",
          err
        );

        setList([]);

      }

    },
    []
  );


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = useCallback(
    async () => {

      try {

        const res = await fetch(
          `${API}/api/products`
        );

        const result =
          await res.json();


        if (result.success) {

          setProducts(
            result.data || []
          );

        } else {

          setProducts([]);

        }

      } catch (err) {

        console.error(
          "Load products error:",
          err
        );

        setProducts([]);

      }

    },
    []
  );


  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  const loadSuppliers = useCallback(
    async () => {

      try {

        const res = await fetch(
          `${API}/api/suppliers`
        );

        const result =
          await res.json();


        if (result.success) {

          setSuppliers(
            result.data || []
          );

        } else {

          setSuppliers([]);

        }

      } catch (err) {

        console.error(
          "Load suppliers error:",
          err
        );

        setSuppliers([]);

      }

    },
    []
  );


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    const init = async () => {

      await loadData();

      await loadProducts();

      await loadSuppliers();

    };


    init();

  }, [
    loadData,
    loadProducts,
    loadSuppliers
  ]);


  // =====================================================
  // PRODUCT SEARCH RESULT
  // =====================================================

  const filteredProducts =
    productSearch.trim() === ""
      ? products.slice(0, 20)
      : products.filter(
          (item) => {

            const keyword =
              productSearch
                .toLowerCase()
                .trim();


            return (

              String(
                item.code || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                item.barcode || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                item.sku || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                item.name || ""
              )
                .toLowerCase()
                .includes(keyword)

            );

          }
        ).slice(0, 20);


  // =====================================================
  // SELECT PRODUCT
  // =====================================================

  const selectProduct = (product) => {

    setForm(
      (prev) => ({

        ...prev,

        product_code:
          product.code || "",

        product_name:
          product.name || "",

        unit:
          product.unit || ""

      })
    );


    setProductSearch(
      `${product.code || ""} - ${
        product.name || ""
      }`
    );


    setShowProductList(false);

  };


  // =====================================================
  // CALCULATE UNIT PRICE
  // =====================================================
  //
  // สูตรที่ถูกต้อง:
  //
  // จำนวน × ราคาต่อหน่วย = ราคารวม
  //
  // ดังนั้น:
  //
  // ราคาต่อหน่วย = ราคารวม ÷ จำนวน
  //
  // =====================================================

  const calculateUnitPrice = (
    qty,
    totalPrice
  ) => {

    const q =
      Number(qty);

    const total =
      Number(totalPrice);


    if (
      !Number.isFinite(q) ||
      !Number.isFinite(total)
    ) {

      return "";

    }


    if (
      q <= 0 ||
      total < 0
    ) {

      return "";

    }


    return total / q;

  };


  // =====================================================
  // CHANGE QTY
  // =====================================================

  const handleQtyChange = (
    value
  ) => {

    setForm(
      (prev) => {

        const unitPrice =
          calculateUnitPrice(
            value,
            prev.total_price
          );


        return {

          ...prev,

          qty:
            value,

          unit_price:
            unitPrice

        };

      }
    );

  };


  // =====================================================
  // CHANGE TOTAL PRICE
  // =====================================================

  const handleTotalPriceChange = (
    value
  ) => {

    setForm(
      (prev) => {

        const unitPrice =
          calculateUnitPrice(
            prev.qty,
            value
          );


        return {

          ...prev,

          total_price:
            value,

          unit_price:
            unitPrice

        };

      }
    );

  };


  // =====================================================
  // SAVE
  // =====================================================

  const saveData = async () => {

    try {

      // -------------------------------------------------
      // Validate Product
      // -------------------------------------------------

      if (!form.product_code) {

        alert(
          "ກະລຸນາເລືອກລະຫັດສິນຄ້າ"
        );

        return;

      }


      if (!form.product_name) {

        alert(
          "ບໍ່ພົບຊື່ສິນຄ້າ"
        );

        return;

      }


      if (
        !form.qty ||
        Number(form.qty) <= 0
      ) {

        alert(
          "ກະລຸນາໃສ່ຈຳນວນສິນຄ້າ"
        );

        return;

      }


      if (
        form.total_price === "" ||
        Number(form.total_price) < 0
      ) {

        alert(
          "ກະລຸນາໃສ່ລາຄາລວມ"
        );

        return;

      }


      // -------------------------------------------------
      // Calculate Unit Price Again
      // -------------------------------------------------
      //
      // คำนวณใหม่ทุกครั้งก่อน Save
      // ไม่ใช้ค่าที่อยู่ใน state โดยตรง
      //
      // unit_price =
      // total_price / qty
      //
      // -------------------------------------------------

      const calculatedUnitPrice =
        calculateUnitPrice(
          form.qty,
          form.total_price
        );


      if (
        calculatedUnitPrice === ""
      ) {

        alert(
          "ບໍ່ສາມາດຄຳນວນລາຄາຕໍ່ໜ່ວຍໄດ້"
        );

        return;

      }


      // -------------------------------------------------
      // FormData
      // -------------------------------------------------

      const formData =
        new FormData();


      Object.keys(form).forEach(
        (key) => {

          formData.append(

            key,

            key === "unit_price"

              ? calculatedUnitPrice

              : form[key] ?? ""

          );

        }
      );


      // -------------------------------------------------
      // Files
      // -------------------------------------------------

      Object.keys(files).forEach(
        (key) => {

          if (files[key]) {

            formData.append(
              key,
              files[key]
            );

          }

        }
      );


      // -------------------------------------------------
      // URL
      // -------------------------------------------------

      let url =
        `${API}/api/exports`;

      let method = "POST";


      if (editId) {

        url =
          `${API}/api/exports/${editId}`;

        method = "PUT";

      }


      // -------------------------------------------------
      // Request
      // -------------------------------------------------

      const res = await fetch(
        url,
        {
          method,
          body: formData
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
        "ບັນທຶກສຳເລັດ"
      );


      // -------------------------------------------------
      // RESET
      // -------------------------------------------------

      setEditId(null);

      setFiles({});

      setOldFiles({});

      setProductSearch("");


      setForm({

        invoice_no: "",

        product_code: "",

        product_name: "",

        qty: "",

        unit: "",

        unit_weight: "",

        weight: "",

        unit_price: "",

        total_price: "",

        supplier: "",

        invoice_date: ""

      });


      await loadData();


    } catch (err) {

      console.error(
        "Export save error:",
        err
      );


      alert(
        "ບັນທຶກບໍ່ສຳເລັດ: " +
        err.message
      );

    }

  };


  // =====================================================
  // DELETE
  // =====================================================

  const deleteData = async (
    id
  ) => {

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
          `${API}/api/exports/${id}`,
          {
            method: "DELETE"
          }
        );


      const result =
        await res.json();


      if (!result.success) {

        throw new Error(
          result.message ||
          "Delete failed"
        );

      }


      await loadData();


    } catch (err) {

      console.error(
        "Delete export error:",
        err
      );


      alert(
        "ລົບບໍ່ສຳເລັດ: " +
        err.message
      );

    }

  };


  // =====================================================
  // EDIT
  // =====================================================

  const editData = (
    item
  ) => {

    setEditId(
      item.id
    );


    // -------------------------------------------------
    // Calculate Unit Price Again
    // -------------------------------------------------

    const calculatedUnitPrice =
      calculateUnitPrice(
        item.qty,
        item.total_price
      );


    setForm({

      invoice_no:
        item.invoice_no || "",

      product_code:
        item.product_code || "",

      product_name:
        item.product_name || "",

      qty:
        item.qty ?? "",

      unit:
        item.unit || "",

      unit_weight:
        item.unit_weight ?? "",

      weight:
        item.weight ?? "",

      unit_price:
        calculatedUnitPrice,

      total_price:
        item.total_price ?? "",

      supplier:
        item.supplier || "",

      invoice_date:
        item.invoice_date || ""

    });


    setProductSearch(

      item.product_code

        ? `${item.product_code} - ${
            item.product_name || ""
          }`

        : item.product_name || ""

    );


    setOldFiles({

      invoice_file:
        item.invoice_file,

      payment_file:
        item.payment_file,

      formd_file:
        item.formd_file,

      phytos_file:
        item.phytos_file,

      tax_file:
        item.tax_file,

      export_license_file:
        item.export_license_file,

      origin_file:
        item.origin_file,

      acdd_file:
        item.acdd_file

    });


    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };


  // =====================================================
  // LOAD IMPORT INVOICE
  // =====================================================

  const loadInvoice = async () => {

    try {

      if (
        !invoiceSearch.trim()
      ) {

        alert(
          "ກະລຸນາໃສ່ Invoice"
        );

        return;

      }


      const res =
        await fetch(

          `${API}/api/imports/invoice/${encodeURIComponent(
            invoiceSearch.trim()
          )}`

        );


      const result =
        await res.json();


      if (
        !result.success
      ) {

        alert(
          "ບໍ່ພົບ Invoice"
        );

        return;

      }


      const data =
        result.data;


      // -------------------------------------------------
      // Import Data
      // -------------------------------------------------

      const qty =
        data.qty ?? "";


      const totalPrice =
        data.total_price ?? "";


      // -------------------------------------------------
      // IMPORTANT
      // -------------------------------------------------
      //
      // ไม่เอา data.unit_price เดิมจาก Import
      // มาใช้โดยตรง
      //
      // คำนวณใหม่:
      //
      // unit_price =
      // total_price / qty
      //
      // -------------------------------------------------

      const unitPrice =
        calculateUnitPrice(
          qty,
          totalPrice
        );


      setForm({

        invoice_no:
          data.invoice_no || "",

        product_code:
          data.product_code || "",

        product_name:
          data.product_name || "",

        qty:

          qty,

        unit:
          data.unit || "",

        unit_weight:
          data.unit_weight ?? "",

        weight:
          data.weight ?? "",

        unit_price:
          unitPrice,

        total_price:
          totalPrice,

        supplier:
          data.supplier || "",

        invoice_date:
          data.invoice_date || ""

      });


      // -------------------------------------------------
      // Product Search Display
      // -------------------------------------------------

      setProductSearch(

        data.product_code

          ? `${data.product_code} - ${
              data.product_name || ""
            }`

          : data.product_name || ""

      );


      // -------------------------------------------------
      // Export Documents Must Be Separate
      // -------------------------------------------------

      setFiles({});

      setOldFiles({});


    } catch (err) {

      console.error(
        "Load import invoice error:",
        err
      );


      alert(
        "ບໍ່ສາມາດດຶງ Invoice ໄດ້"
      );

    }

  };


  // =====================================================
  // FILTER EXPORT
  // =====================================================

  const filtered =
    search.trim() === ""

      ? []

      : list.filter(
          (item) => {

            const keyword =
              search
                .toLowerCase()
                .trim();


            return (

              String(
                item.invoice_no || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                item.product_code || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                item.product_name || ""
              )
                .toLowerCase()
                .includes(keyword)

              ||

              String(
                item.supplier || ""
              )
                .toLowerCase()
                .includes(keyword)

            );

          }
        );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="page">

      <h1>
        📤 ສົ່ງອອກສິນຄ້າ
      </h1>


      {/* =================================================
          PRODUCT
      ================================================= */}

      <div className="card">

        <h3>
          📦 ຂໍ້ມູນສິນຄ້າ
        </h3>


        {/* IMPORT INVOICE */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "15px"
          }}
        >

          <input
            placeholder="ໃສ່ເລກ Invoice ທີ່ຈະນຳອອກ"
            value={invoiceSearch}
            onChange={(e) =>
              setInvoiceSearch(
                e.target.value
              )
            }
          />


          <button
            type="button"
            onClick={loadInvoice}
          >
            📥 ດຶງຂໍ້ມູນ
          </button>

        </div>


        {/* =================================================
            PRODUCT CODE
        ================================================= */}

        <div
          style={{
            position: "relative",
            marginBottom: "10px"
          }}
        >

          <input
            placeholder="ຄົ້ນຫາລະຫັດສິນຄ້າ / Barcode / SKU / ຊື່ສິນຄ້າ"
            value={productSearch}
            onFocus={() =>
              setShowProductList(true)
            }
            onChange={(e) => {

              setProductSearch(
                e.target.value
              );

              setShowProductList(
                true
              );


              setForm(
                (prev) => ({

                  ...prev,

                  product_code: "",

                  product_name: ""

                })
              );

            }}
          />


          {showProductList && (

            <div
              style={{
                position: "absolute",
                width: "100%",
                background: "#fff",
                border: "1px solid #ccc",
                maxHeight: "250px",
                overflowY: "auto",
                zIndex: 9999,
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >

              {filteredProducts.length === 0 ? (

                <div
                  style={{
                    padding: "12px"
                  }}
                >
                  ບໍ່ພົບສິນຄ້າ
                </div>

              ) : (

                filteredProducts.map(
                  (product) => (

                    <div
                      key={product.id}
                      style={{
                        padding: "12px",
                        cursor: "pointer",
                        borderBottom:
                          "1px solid #eee"
                      }}
                      onMouseDown={(e) => {

                        e.preventDefault();

                        selectProduct(
                          product
                        );

                      }}
                    >

                      <strong>
                        {product.code}
                      </strong>

                      {" - "}

                      {product.name}

                    </div>

                  )
                )

              )}

            </div>

          )}

        </div>


        {/* SELECTED PRODUCT */}

        {form.product_code && (

          <div
            style={{
              background: "#f3f4f6",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "10px"
            }}
          >

            <strong>
              ລະຫັດສິນຄ້າ:
            </strong>

            {" "}

            {form.product_code}

            <br />

            <strong>
              ຊື່ສິນຄ້າ:
            </strong>

            {" "}

            {form.product_name}

          </div>

        )}


        {/* PRODUCT NAME */}

        <input
          placeholder="ຊື່ສິນຄ້າ"
          value={form.product_name}
          readOnly
        />


        {/* QTY */}

        <input
          type="number"
          min="0"
          placeholder="ຈຳນວນ"
          value={form.qty}
          onChange={(e) =>
            handleQtyChange(
              e.target.value
            )
          }
        />


        {/* UNIT */}

        <input
          placeholder="ຫົວໜ່ວຍ"
          value={form.unit}
          onChange={(e) =>
            setForm({
              ...form,
              unit:
                e.target.value
            })
          }
        />


        {/* UNIT WEIGHT */}

        <input
          type="number"
          min="0"
          placeholder="ນ້ຳໜັກຕໍ່ໜ່ວຍ"
          value={form.unit_weight}
          onChange={(e) =>
            setForm({
              ...form,
              unit_weight:
                e.target.value
            })
          }
        />


        {/* TOTAL WEIGHT */}

        <input
          type="number"
          min="0"
          placeholder="ນ້ຳໜັກລວມ"
          value={form.weight}
          onChange={(e) =>
            setForm({
              ...form,
              weight:
                e.target.value
            })
          }
        />


        {/* TOTAL PRICE */}

        <input
          type="number"
          min="0"
          placeholder="ລາຄາລວມ"
          value={form.total_price}
          onChange={(e) =>
            handleTotalPriceChange(
              e.target.value
            )
          }
        />


        {/* UNIT PRICE */}

        <input
          type="number"
          value={form.unit_price}
          readOnly
          placeholder="ລາຄາຕໍ່ໜ່ວຍ"
          style={{
            background: "#f3f4f6",
            fontWeight: "bold"
          }}
        />


        {/* =================================================
            SUPPLIER
        ================================================= */}

        <div
          style={{
            position: "relative"
          }}
        >

          <input
            placeholder="ຜູ້ສະໜອງ"
            value={form.supplier}
            onFocus={() =>
              setShowSupplierList(true)
            }
            onChange={(e) => {

              setForm({

                ...form,

                supplier:
                  e.target.value

              });

              setShowSupplierList(
                true
              );

            }}
          />


          {showSupplierList &&
            form.supplier !== "" && (

              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  background: "#fff",
                  border:
                    "1px solid #ccc",
                  maxHeight: "180px",
                  overflowY: "auto",
                  zIndex: 9999
                }}
              >

                {suppliers

                  .filter(
                    (item) =>
                      String(
                        item.supplier_name ||
                        ""
                      )
                        .toLowerCase()
                        .includes(
                          form.supplier
                            .toLowerCase()
                        )
                  )

                  .map(
                    (item) => (

                      <div
                        key={item.id}
                        style={{
                          padding: "10px",
                          cursor:
                            "pointer"
                        }}
                        onMouseDown={() => {

                          setForm({

                            ...form,

                            supplier:
                              item.supplier_name

                          });

                          setShowSupplierList(
                            false
                          );

                        }}
                      >

                        {item.supplier_name}

                      </div>

                    )
                  )}

              </div>

            )}

        </div>


        {/* DATE */}

        <input
          type="date"
          value={form.invoice_date}
          onChange={(e) =>
            setForm({
              ...form,
              invoice_date:
                e.target.value
            })
          }
          onClick={(e) => {

            if (
              e.target.showPicker
            ) {

              e.target.showPicker();

            }

          }}
        />


        {/* SAVE */}

        <button
          onClick={saveData}
        >

          {editId
            ? "💾 ແກ້ໄຂ"
            : "💾 ບັນທຶກ"}

        </button>

      </div>


      {/* =================================================
          DOCUMENTS
      ================================================= */}

      <div className="card">

        <h3>
          📎 ແນບເອກະສານສົ່ງອອກ
        </h3>


        <select
          value={docType}
          onChange={(e) =>
            setDocType(
              e.target.value
            )
          }
        >

          <option value="invoice_file">
            INVOICE
          </option>

          <option value="payment_file">
            ໃບໂອນເງິນ
          </option>

          <option value="formd_file">
            FORM D
          </option>

          <option value="phytos_file">
            PHYTOS
          </option>

          <option value="tax_file">
            ໃບມອບອາກອນ
          </option>

          <option value="export_license_file">
            ໃບອານຸຍາດສົ່ງອອກ
          </option>

          <option value="origin_file">
            ໃບຢັ້ງຢືນແຫຼ່ງກຳເນີດ
          </option>

          <option value="acdd_file">
            ໃບແຈ້ງ ACDD
          </option>

        </select>


        <input
          type="file"
          onChange={(e) => {

            const file =
              e.target.files[0];


            if (!file) return;


            setFiles({

              ...files,

              [docType]:
                file

            });

          }}
        />


        <div
          style={{
            marginTop: "10px"
          }}
        >

          {Object.keys(files).length === 0 &&
          Object.values(oldFiles)
            .filter(Boolean)
            .length === 0 ? (

            <p>
              ຍັງບໍ່ມີເອກະສານ
            </p>

          ) : (

            <>

              {/* OLD FILES */}

              {Object.entries(
                oldFiles
              )
                .filter(
                  ([, file]) =>
                    file
                )
                .map(
                  ([type, file]) => (

                    <div
                      key={type}
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        padding:
                          "8px",
                        borderBottom:
                          "1px solid #ddd"
                      }}
                    >

                      <a
                        href={`${API}/uploads/${file}`}
                        target="_blank"
                        rel="noreferrer"
                      >

                        📄 {file}

                      </a>

                    </div>

                  )
                )}


              {/* NEW FILES */}

              {Object.entries(files)
                .map(
                  ([key, file]) => (

                    <div
                      key={key}
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        marginBottom:
                          "5px"
                      }}
                    >

                      <span>
                        {file?.name}
                      </span>


                      <button
                        type="button"
                        onClick={() => {

                          const temp =
                            {
                              ...files
                            };

                          delete temp[key];

                          setFiles(
                            temp
                          );

                        }}
                      >

                        ❌

                      </button>

                    </div>

                  )
                )}

            </>

          )}

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="card">

        <input
          placeholder="ຄົ້ນຫາ Invoice / Product Code / Product / Supplier"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <table>

        <thead>

          <tr>

            <th>ID</th>

            <th>Invoice</th>

            <th>Product Code</th>

            <th>Product</th>

            <th>Qty</th>

            <th>Weight</th>

            <th>Unit Price</th>

            <th>Total Price</th>

            <th>Supplier</th>

            <th>Date</th>

            <th>Files</th>

            <th>Action</th>

          </tr>

        </thead>


        <tbody>

          {search.trim() === "" ? (

            <tr>

              <td
                colSpan="12"
                align="center"
              >

                ພິມ Invoice / Product
                ເພື່ອຄົ້ນຫາ

              </td>

            </tr>

          ) : filtered.length === 0 ? (

            <tr>

              <td
                colSpan="12"
                align="center"
              >

                ບໍ່ພົບຂໍ້ມູນ

              </td>

            </tr>

          ) : (

            filtered.map(
              (item) => (

                <tr
                  key={item.id}
                >

                  <td>
                    {item.id}
                  </td>

                  <td>
                    {item.invoice_no}
                  </td>

                  <td>
                    {item.product_code || "-"}
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
                    {item.unit_price ?? "-"}
                  </td>

                  <td>
                    {item.total_price}
                  </td>

                  <td>
                    {item.supplier}
                  </td>

                  <td>
                    {item.invoice_date}
                  </td>


                  {/* FILES */}

                  <td>

                    {item.invoice_file && (

                      <>

                        <a
                          href={`${API}/uploads/${item.invoice_file}`}
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
                          href={`${API}/uploads/${item.payment_file}`}
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
                          href={`${API}/uploads/${item.formd_file}`}
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
                          href={`${API}/uploads/${item.phytos_file}`}
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
                          href={`${API}/uploads/${item.tax_file}`}
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
                          href={`${API}/uploads/${item.export_license_file}`}
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
                          href={`${API}/uploads/${item.origin_file}`}
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
                          href={`${API}/uploads/${item.acdd_file}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📄 ACDD
                        </a>

                        <br />

                      </>

                    )}

                  </td>


                  {/* ACTION */}

                  <td>

                    <button
                      onClick={() =>
                        editData(
                          item
                        )
                      }
                    >
                      ✏️ Edit
                    </button>


                    <button
                      onClick={() =>
                        deleteData(
                          item.id
                        )
                      }
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

  );

}


export default ExportInvoice;