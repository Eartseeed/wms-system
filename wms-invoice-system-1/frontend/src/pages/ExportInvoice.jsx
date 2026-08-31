import { API } from "../config/api";

import {
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";


function ExportInvoice() {

  const token =
    localStorage.getItem("token");


  // =====================================================
  // UNIT MASTER DATA
  // =====================================================

  const UNIT_OPTIONS = [

    {
      value: "ໂຕ",
      meaning: "ຫົວໜ່ວຍນັບສັດ"
    },

    {
      value: "ກລ",
      meaning: "ກິໂລກຣາມ"
    },

    {
      value: "ລິດ",
      meaning: "ຫົວໜ່ວຍປະລິມານຂອງແຫຼວ"
    },

    {
      value: "ກິໂລໂວນ",
      meaning: "ຫົວໜ່ວຍກຳລັງໄຟຟ້າ"
    },

    {
      value: "ແມັດ",
      meaning: "ຫົວໜ່ວຍວັດແທກຄວາມຍາວ"
    },

    {
      value: "ມ3",
      meaning: "ຫົວໜ່ວຍວັດແທກປະລິມານ"
    },

    {
      value: "ມ2",
      meaning: "ຫົວໜ່ວຍວັດແທກເນື້ອທີ່"
    },

    {
      value: "ຊຸດ",
      meaning: "ຫົວໜ່ວຍນັບເປັນຊຸດ"
    },

    {
      value: "ໂຫຼ",
      meaning: "ຫົວໜ່ວຍນັບເປັນໂຫຼ"
    },

    {
      value: "ຄູ່",
      meaning: "ຫົວໜ່ວຍນັບເປັນຄູ່"
    },

    {
      value: "ຜືນ",
      meaning: "ຫົວໜ່ວຍນັບແຜ່ນຜ້າ"
    },

    {
      value: "ອັນ",
      meaning: "ຫົວໜ່ວຍນັບສິ່ງຂອງ"
    },

    {
      value: "ໜ່ວຍ",
      meaning: "ຫົວໜ່ວຍນັບທົ່ວໄປ"
    },

    {
      value: "ເຄື່ອງ",
      meaning: "ຫົວໜ່ວຍນັບເຄື່ອງຈັກ"
    },

    {
      value: "ກ້ອນ",
      meaning: "ຫົວໜ່ວຍນັບເປັນກ້ອນ"
    },

    {
      value: "ຫຼອດ",
      meaning: "ຫົວໜ່ວຍນັບເປັນຫຼອດ"
    },

    {
      value: "ຫົວ",
      meaning: "ຫົວໜ່ວຍນັບເປັນຫົວ"
    },

    {
      value: "ຂະບວນ",
      meaning: "ຫົວໜ່ວຍນັບເປັນຂະບວນ"
    },

    {
      value: "ຄັນ",
      meaning: "ຫົວໜ່ວຍນັບພາຫະນະ"
    },

    {
      value: "ລຳ",
      meaning: "ຫົວໜ່ວຍນັບເຮືອ ຫຼື ຍົນ"
    },

    {
      value: "ກະບອກ",
      meaning: "ຫົວໜ່ວຍນັບເປັນກະບອກ"
    },

    {
      value: "ດ້າມ",
      meaning: "ຫົວໜ່ວຍນັບເປັນດ້າມ"
    },

    {
      value: "ແຜ່ນ",
      meaning: "ຫົວໜ່ວຍນັບເປັນແຜ່ນ"
    },

    {
      value: "ໃບ",
      meaning: "ຫົວໜ່ວຍນັບເປັນໃບ"
    },

    {
      value: "ທ່ອນ",
      meaning: "ຫົວໜ່ວຍນັບເປັນທ່ອນ"
    }

  ];


  // =====================================================
  // REF
  // =====================================================

  const unitRef =
    useRef(null);

  const supplierRef =
    useRef(null);


  // =====================================================
  // STATE
  // =====================================================

  const [list, setList] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [docType, setDocType] =
    useState("invoice_file");

  const [files, setFiles] =
    useState({});

  const [oldFiles, setOldFiles] =
    useState({});

  const [suppliers, setSuppliers] =
    useState([]);

  const [
    showSupplierList,
    setShowSupplierList
  ] = useState(false);

  const [
    showUnitList,
    setShowUnitList
  ] = useState(false);

  const [
    invoiceSearch,
    setInvoiceSearch
  ] = useState("");


  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] =
    useState({

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
  // NUMBER FORMAT
  // =====================================================

  const removeComma =
    (value) => {

      return String(
        value ?? ""
      )
        .replace(
          /,/g,
          ""
        )
        .trim();

    };


  const numberValue =
    (value) => {

      const clean =
        removeComma(value);

      if (
        clean === "" ||
        clean === "."
      ) {

        return NaN;

      }

      return Number(clean);

    };


  const formatNumberInput =
    (value) => {

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {

        return "";

      }


      let clean =
        String(value)
          .replace(
            /,/g,
            ""
          )
          .replace(
            /[^0-9.]/g,
            ""
          );


      const firstDot =
        clean.indexOf(".");


      if (
        firstDot !== -1
      ) {

        clean =
          clean.slice(
            0,
            firstDot + 1
          ) +
          clean
            .slice(
              firstDot + 1
            )
            .replace(
              /\./g,
              ""
            );

      }


      if (
        clean === ""
      ) {

        return "";

      }


      if (
        clean === "."
      ) {

        return "";

      }


      const parts =
        clean.split(".");


      let integerPart =
        parts[0] || "0";


      integerPart =
        integerPart.replace(
          /^0+(?=\d)/,
          ""
        );


      const formattedInteger =
        Number(
          integerPart
        )
          .toLocaleString(
            "en-US",
            {
              maximumFractionDigits:
                0
            }
          );


      if (
        firstDot !== -1
      ) {

        return (
          formattedInteger +
          "." +
          (parts[1] || "")
        );

      }


      return formattedInteger;

    };


  const formatNumberDisplay =
    (value, maxDecimal = 2) => {

      const num =
        numberValue(value);


      if (
        !Number.isFinite(num)
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

    };


  // =====================================================
  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // =====================================================

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          unitRef.current &&
          !unitRef.current.contains(
            event.target
          )
        ) {

          setShowUnitList(
            false
          );

        }


        if (
          supplierRef.current &&
          !supplierRef.current.contains(
            event.target
          )
        ) {

          setShowSupplierList(
            false
          );

        }

      };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  // =====================================================
  // LOAD EXPORT
  // =====================================================

  const loadData =
    useCallback(async () => {

      try {

        const res =
          await fetch(
            `${API}/exports`,
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
          "Load export error:",
          err
        );

        setList([]);

      }

    }, [token]);


  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  const loadSuppliers =
    useCallback(async () => {

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

          setSuppliers([]);

          return;

        }


        setSuppliers(
          Array.isArray(
            result.data
          )
            ? result.data
            : []
        );


      } catch (err) {

        console.error(
          "Load suppliers error:",
          err
        );

        setSuppliers([]);

      }

    }, [token]);


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadData();

    loadSuppliers();

  }, [
    loadData,
    loadSuppliers
  ]);


  // =====================================================
  // CALCULATE UNIT PRICE
  // =====================================================

  const calculateUnitPrice =
    (
      qty,
      totalPrice
    ) => {

      const q =
        numberValue(qty);

      const total =
        numberValue(totalPrice);


      if (
        !Number.isFinite(q) ||
        q <= 0
      ) {

        return "";

      }


      if (
        !Number.isFinite(total) ||
        total < 0
      ) {

        return "";

      }


      return (
        total / q
      ).toFixed(2);

    };


  // =====================================================
  // CHANGE QTY
  // =====================================================

  const handleQtyChange =
    (value) => {

      const formatted =
        formatNumberInput(value);


      setForm(
        (prev) => {

          const unitPrice =
            calculateUnitPrice(
              formatted,
              prev.total_price
            );


          return {

            ...prev,

            qty:
              formatted,

            unit_price:
              unitPrice
                ? formatNumberInput(
                    unitPrice
                  )
                : ""

          };

        }
      );

    };


  // =====================================================
  // CHANGE TOTAL PRICE
  // =====================================================

  const handleTotalPriceChange =
    (value) => {

      const formatted =
        formatNumberInput(value);


      setForm(
        (prev) => {

          const unitPrice =
            calculateUnitPrice(
              prev.qty,
              formatted
            );


          return {

            ...prev,

            total_price:
              formatted,

            unit_price:
              unitPrice
                ? formatNumberInput(
                    unitPrice
                  )
                : ""

          };

        }
      );

    };


  // =====================================================
  // UNIT SEARCH
  // =====================================================

  const unitKeyword =
    String(
      form.unit || ""
    )
      .trim()
      .toLowerCase();


  const filteredUnits =
    UNIT_OPTIONS
      .filter(
        (item) => {

          if (!unitKeyword) {

            return true;

          }


          return (

            item.value
              .toLowerCase()
              .includes(
                unitKeyword
              )

            ||

            item.meaning
              .toLowerCase()
              .includes(
                unitKeyword
              )

          );

        }
      )
      .slice(0, 5);


  // =====================================================
  // SELECT UNIT
  // =====================================================

  const selectUnit =
    (unit) => {

      setForm(
        (prev) => ({

          ...prev,

          unit:
            unit.value

        })
      );


      setShowUnitList(
        false
      );

    };


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm =
    () => {

      setEditId(
        null
      );

      setFiles(
        {}
      );

      setOldFiles(
        {}
      );

      setDocType(
        "invoice_file"
      );

      setInvoiceSearch(
        ""
      );

      setShowSupplierList(
        false
      );

      setShowUnitList(
        false
      );


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

    };


  // =====================================================
  // SAVE
  // =====================================================

  const saveData =
    async () => {

      try {

        if (
          !/^\d+$/.test(
            String(
              form.product_code || ""
            ).trim()
          )
        ) {

          alert(
            "Product Number ຕ້ອງເປັນຕົວເລກເທົ່ານັ້ນ"
          );

          return;

        }


        if (
          !String(
            form.product_name || ""
          ).trim()
        ) {

          alert(
            "ກະລຸນາໃສ່ຊື່ສິນຄ້າ"
          );

          return;

        }


        const qty =
          numberValue(
            form.qty
          );


        if (
          !Number.isFinite(
            qty
          ) ||
          qty <= 0
        ) {

          alert(
            "ກະລຸນາໃສ່ຈຳນວນສິນຄ້າ"
          );

          return;

        }


        const totalPrice =
          numberValue(
            form.total_price
          );


        if (
          !Number.isFinite(
            totalPrice
          ) ||
          totalPrice < 0
        ) {

          alert(
            "ກະລຸນາໃສ່ລາຄາລວມ"
          );

          return;

        }


        const unitWeight =
          numberValue(
            form.unit_weight
          );


        const weight =
          numberValue(
            form.weight
          );


        const unitPrice =
          calculateUnitPrice(
            qty,
            totalPrice
          );


        if (
          unitPrice === ""
        ) {

          alert(
            "ບໍ່ສາມາດຄຳນວນລາຄາຕໍ່ໜ່ວຍໄດ້"
          );

          return;

        }


        const formData =
          new FormData();


        formData.append(
          "invoice_no",
          form.invoice_no ?? ""
        );


        formData.append(
          "product_code",
          form.product_code ?? ""
        );


        formData.append(
          "product_name",
          form.product_name ?? ""
        );


        formData.append(
          "qty",
          qty
        );


        formData.append(
          "unit",
          form.unit ?? ""
        );


        formData.append(
          "unit_weight",
          Number.isFinite(unitWeight)
            ? unitWeight
            : ""
        );


        formData.append(
          "weight",
          Number.isFinite(weight)
            ? weight
            : ""
        );


        formData.append(
          "unit_price",
          numberValue(unitPrice)
        );


        formData.append(
          "total_price",
          totalPrice
        );


        formData.append(
          "supplier",
          form.supplier ?? ""
        );


        formData.append(
          "invoice_date",
          form.invoice_date ?? ""
        );


        Object.entries(
          files
        ).forEach(
          ([key, file]) => {

            if (
              file
            ) {

              formData.append(
                key,
                file
              );

            }

          }
        );


        let url =
          `${API}/exports`;

        let method =
          "POST";


        if (
          editId
        ) {

          url =
            `${API}/exports/${editId}`;

          method =
            "PUT";

        }


        const res =
          await fetch(
            url,
            {
              method,

              headers: {
                Authorization:
                  `Bearer ${token}`
              },

              body:
                formData
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


        resetForm();

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
            `${API}/exports/${id}`,
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

          resetForm();

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

  const editData =
    (item) => {

      setEditId(
        item.id
      );


      const unitPrice =
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
          item.qty !== null && item.qty !== undefined
            ? formatNumberInput(item.qty)
            : "",

        unit:
          item.unit || "",

        unit_weight:
          item.unit_weight !== null && item.unit_weight !== undefined
            ? formatNumberInput(item.unit_weight)
            : "",

        weight:
          item.weight !== null && item.weight !== undefined
            ? formatNumberInput(item.weight)
            : "",

        unit_price:
          unitPrice
            ? formatNumberInput(unitPrice)
            : "",

        total_price:
          item.total_price !== null && item.total_price !== undefined
            ? formatNumberInput(item.total_price)
            : "",

        supplier:
          item.supplier || "",

        invoice_date:
          item.invoice_date || ""

      });


      setOldFiles({

        invoice_file:
          item.invoice_file || "",

        payment_file:
          item.payment_file || "",

        formd_file:
          item.formd_file || "",

        phytos_file:
          item.phytos_file || "",

        tax_file:
          item.tax_file || "",

        export_license_file:
          item.export_license_file || "",

        origin_file:
          item.origin_file || "",

        acdd_file:
          item.acdd_file || ""

      });


      setFiles(
        {}
      );

      setShowSupplierList(
        false
      );

      setShowUnitList(
        false
      );


      window.scrollTo({

        top: 0,

        behavior:
          "smooth"

      });

    };


  // =====================================================
  // LOAD IMPORT INVOICE
  // =====================================================

  const loadInvoice =
    async () => {

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
            `${API}/imports/invoice/${encodeURIComponent(
              invoiceSearch.trim()
            )}`,
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

          alert(
            result.message ||
            "ບໍ່ພົບ Invoice"
          );

          return;

        }


        const data =
          result.data;


        const qty =
          data.qty !== null && data.qty !== undefined
            ? formatNumberInput(data.qty)
            : "";

        const totalPrice =
          data.total_price !== null && data.total_price !== undefined
            ? formatNumberInput(data.total_price)
            : "";


        setForm({

          invoice_no:
            data.invoice_no || "",

          product_code:
            data.product_code || "",

          product_name:
            data.product_name || "",

          qty,

          unit:
            data.unit || "",

          unit_weight:
            data.unit_weight !== null && data.unit_weight !== undefined
              ? formatNumberInput(data.unit_weight)
              : "",

          weight:
            data.weight !== null && data.weight !== undefined
              ? formatNumberInput(data.weight)
              : "",

          unit_price:
            calculateUnitPrice(
              qty,
              totalPrice
            ),

          total_price:
            totalPrice,

          supplier:
            data.supplier || "",

          invoice_date:
            data.invoice_date || ""

        });


        setEditId(
          null
        );

        setFiles(
          {}
        );

        setOldFiles(
          {}
        );

        setShowSupplierList(
          false
        );

        setShowUnitList(
          false
        );


      } catch (err) {

        console.error(
          "Load import invoice error:",
          err
        );


        alert(
          "ບໍ່ສາມາດດຶງ Invoice ໄດ້: " +
          err.message
        );

      }

    };


  // =====================================================
  // FILTER
  // =====================================================

  const keyword =
    search
      .trim()
      .toLowerCase();


  const filtered =
    keyword === ""

      ? []

      : list.filter(
          (item) => {

            const fields = [

              item.invoice_no,

              item.product_code,

              item.product_name,

              item.supplier

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
  // FILE URL
  // =====================================================

  const getFileUrl =
    (file) => {

      if (
        !file
      ) {

        return "";

      }


      return `${
        API.replace(
          "/api",
          ""
        )
      }/uploads/${file}`;

    };


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
            display:
              "flex",

            gap:
              "10px",

            marginBottom:
              "15px"
          }}
        >

          <input
            placeholder="ໃສ່ເລກ Invoice ທີ່ຈະນຳອອກ"
            value={
              invoiceSearch
            }
            onChange={(e) =>
              setInvoiceSearch(
                e.target.value
              )
            }
          />


          <button
            type="button"
            onClick={
              loadInvoice
            }
          >
            📥 ດຶງຂໍ້ມູນ
          </button>

        </div>


        {/* PRODUCT NUMBER */}

        <input
          placeholder="Product Number (ตัวเลขเท่านั้น)"
          inputMode="numeric"
          pattern="[0-9]*"
          value={
            form.product_code
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                product_code:
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )

              })
            )
          }
        />


        {/* PRODUCT NAME */}

        <input
          placeholder="ຊື່ສິນຄ້າ"
          value={
            form.product_name
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                product_name:
                  e.target.value

              })
            )
          }
        />


        {/* QTY */}

        <input
          type="text"
          inputMode="decimal"
          placeholder="ຈຳນວນ"
          value={
            form.qty
          }
          onChange={(e) =>
            handleQtyChange(
              e.target.value
            )
          }
        />


        {/* UNIT */}

        <div
          ref={
            unitRef
          }
          style={{
            position:
              "relative",

            width:
              "100%"
          }}
        >

          <input
            placeholder="ຫົວໜ່ວຍ - ພິມເພື່ອຄົ້ນຫາ"
            value={
              form.unit
            }
            onFocus={() => {

              setShowUnitList(
                true
              );

              setShowSupplierList(
                false
              );

            }}
            onChange={(e) => {

              setForm(
                (prev) => ({

                  ...prev,

                  unit:
                    e.target.value

                })
              );


              setShowUnitList(
                true
              );

            }}
          />


          {showUnitList && (

            <div
              style={{
                position:
                  "absolute",

                top:
                  "100%",

                left:
                  0,

                width:
                  "100%",

                background:
                  "#fff",

                border:
                  "1px solid #ccc",

                borderRadius:
                  "6px",

                maxHeight:
                  "250px",

                overflowY:
                  "auto",

                zIndex:
                  99999,

                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >

              {filteredUnits.length === 0 ? (

                <div
                  style={{
                    padding:
                      "12px",

                    color:
                      "#777"
                  }}
                >

                  ບໍ່ພົບຫົວໜ່ວຍ

                </div>

              ) : (

                filteredUnits.map(
                  (item) => (

                    <div
                      key={
                        item.value
                      }
                      onMouseDown={(e) => {

                        e.preventDefault();

                        selectUnit(
                          item
                        );

                      }}
                      style={{
                        padding:
                          "10px 12px",

                        cursor:
                          "pointer",

                        borderBottom:
                          "1px solid #eee"
                      }}
                      onMouseEnter={(e) => {

                        e.currentTarget.style.background =
                          "#f3f4f6";

                      }}
                      onMouseLeave={(e) => {

                        e.currentTarget.style.background =
                          "#fff";

                      }}
                    >

                      <div
                        style={{
                          fontWeight:
                            "bold"
                        }}
                      >

                        {item.value}

                      </div>


                      <div
                        style={{
                          fontSize:
                            "12px",

                          color:
                            "#777",

                          marginTop:
                            "3px"
                        }}
                      >

                        {item.meaning}

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          )}

        </div>


        {/* UNIT WEIGHT */}

        <input
          type="text"
          inputMode="decimal"
          placeholder="ນ້ຳໜັກຕໍ່ໜ່ວຍ"
          value={
            form.unit_weight
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                unit_weight:
                  formatNumberInput(
                    e.target.value
                  )

              })
            )
          }
        />


        {/* TOTAL WEIGHT */}

        <input
          type="text"
          inputMode="decimal"
          placeholder="ນ້ຳໜັກລວມ"
          value={
            form.weight
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                weight:
                  formatNumberInput(
                    e.target.value
                  )

              })
            )
          }
        />


        {/* TOTAL PRICE */}

        <input
          type="text"
          inputMode="decimal"
          placeholder="ລາຄາລວມ"
          value={
            form.total_price
          }
          onChange={(e) =>
            handleTotalPriceChange(
              e.target.value
            )
          }
        />


        {/* UNIT PRICE */}

        <input
          type="text"
          inputMode="decimal"
          placeholder="ລາຄາຕໍ່ໜ່ວຍ"
          value={
            form.unit_price
          }
          readOnly
          style={{
            background:
              "#f3f4f6",

            fontWeight:
              "bold",

            cursor:
              "not-allowed"
          }}
        />


        {/* SUPPLIER */}

        <div
          ref={
            supplierRef
          }
          style={{
            position:
              "relative",

            width:
              "100%"
          }}
        >

          <input
            placeholder="ຜູ້ສະໜອງ"
            value={
              form.supplier
            }
            onFocus={() => {

              setShowSupplierList(
                true
              );

              setShowUnitList(
                false
              );

            }}
            onChange={(e) => {

              setForm(
                (prev) => ({

                  ...prev,

                  supplier:
                    e.target.value

                })
              );


              setShowSupplierList(
                true
              );

            }}
          />


          {showSupplierList &&
            form.supplier !== "" && (

              <div
                style={{
                  position:
                    "absolute",

                  top:
                    "100%",

                  left:
                    0,

                  width:
                    "100%",

                  background:
                    "#fff",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "6px",

                  maxHeight:
                    "180px",

                  overflowY:
                    "auto",

                  zIndex:
                    99999,

                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.15)"
                }}
              >

                {suppliers

                  .filter(
                    (item) => {

                      const name =
                        String(
                          item.supplier_name ||
                          ""
                        );


                      return name
                        .toLowerCase()
                        .includes(
                          String(
                            form.supplier ||
                            ""
                          )
                            .toLowerCase()
                        );

                    }
                  )

                  .map(
                    (item) => {

                      const name =
                        String(
                          item.supplier_name ||
                          ""
                        );


                      if (
                        !name
                      ) {

                        return null;

                      }


                      return (

                        <div
                          key={
                            item.id
                          }
                          onMouseDown={(e) => {

                            e.preventDefault();


                            setForm(
                              (prev) => ({

                                ...prev,

                                supplier:
                                  name

                              })
                            );


                            setShowSupplierList(
                              false
                            );

                          }}
                          style={{
                            padding:
                              "10px",

                            cursor:
                              "pointer"
                          }}
                          onMouseEnter={(e) => {

                            e.currentTarget.style.background =
                              "#f3f4f6";

                          }}
                          onMouseLeave={(e) => {

                            e.currentTarget.style.background =
                              "#fff";

                          }}
                        >

                          {name}

                        </div>

                      );

                    }
                  )}

              </div>

            )}

        </div>


        {/* DATE */}

        <input
          type="date"
          value={
            form.invoice_date
          }
          onChange={(e) =>
            setForm(
              (prev) => ({

                ...prev,

                invoice_date:
                  e.target.value

              })
            )
          }
          onClick={(e) => {

            if (
              typeof e.target.showPicker ===
              "function"
            ) {

              e.target.showPicker();

            }

          }}
        />


        {/* SAVE */}

        <button
          type="button"
          onClick={
            saveData
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
              resetForm
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
          DOCUMENTS
      ================================================= */}

      <div className="card">

        <h3>
          📎 ແນບເອກະສານສົ່ງອອກ
        </h3>


        <select
          value={
            docType
          }
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
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {

            const file =
              e.target.files?.[0];


            if (
              !file
            ) {

              return;

            }


            setFiles(
              (prev) => ({

                ...prev,

                [docType]:
                  file

              })
            );


            e.target.value =
              "";

          }}
        />


        <div
          style={{
            marginTop:
              "10px"
          }}
        >

          {Object.keys(
            files
          ).length === 0 &&

          Object.values(
            oldFiles
          )
            .filter(Boolean)
            .length === 0 ? (

            <p>
              ຍັງບໍ່ມີເອກະສານ
            </p>

          ) : (

            <>

              {Object.entries(
                oldFiles
              )
                .filter(
                  ([, file]) =>
                    Boolean(file)
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

                        alignItems:
                          "center",

                        padding:
                          "8px",

                        borderBottom:
                          "1px solid #ddd"
                      }}
                    >

                      <a
                        href={
                          getFileUrl(
                            file
                          )
                        }
                        target="_blank"
                        rel="noreferrer"
                      >

                        📄 {file}

                      </a>

                    </div>

                  )
                )}


              {Object.entries(
                files
              )
                .map(
                  ([key, file]) => (

                    <div
                      key={key}
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",

                        padding:
                          "8px",

                        borderBottom:
                          "1px solid #ddd"
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


                          delete temp[
                            key
                          ];


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

        <h3>
          🔍 ຄົ້ນຫາ
        </h3>


        <input
          placeholder="ຄົ້ນຫາ Invoice / Product Code / Product / Supplier"
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


      {/* =================================================
          TABLE
      ================================================= */}

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
                Invoice
              </th>

              <th>
                Product Code
              </th>

              <th>
                Product
              </th>

              <th>
                Qty
              </th>

              <th>
                Weight
              </th>

              <th>
                Unit Price
              </th>

              <th>
                Total Price
              </th>

              <th>
                Supplier
              </th>

              <th>
                Date
              </th>

              <th>
                Files
              </th>

              <th>
                Action
              </th>

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
                    key={
                      item.id
                    }
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
                      {formatNumberDisplay(
                        item.qty
                      )}
                    </td>

                    <td>
                      {formatNumberDisplay(
                        item.weight
                      )}
                    </td>

                    <td>
                      {formatNumberDisplay(
                        calculateUnitPrice(
                          item.qty,
                          item.total_price
                        )
                      )}
                    </td>

                    <td>
                      {formatNumberDisplay(
                        item.total_price
                      )}
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
                            href={
                              getFileUrl(
                                item.invoice_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.payment_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.formd_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.phytos_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.tax_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.export_license_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.origin_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.acdd_file
                              )
                            }
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
                        type="button"
                        onClick={() =>
                          deleteData(
                            item.id
                          )
                        }
                      >

                        🗑

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


export default ExportInvoice;