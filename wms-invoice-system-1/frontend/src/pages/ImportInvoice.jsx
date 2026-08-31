import { API } from "../config/api";

import {
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";


function ImportInvoice() {

  const token =
    localStorage.getItem("token");


  // =====================================================
  // REF FOR DROPDOWN
  // =====================================================

  const unitDropdownRef =
    useRef(null);

  const supplierDropdownRef =
    useRef(null);


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
      meaning: "ຫົວໜ່ວຍກຳລັງໄຟຟ້າ (ກິໂລໂວນແອມແປ)"
    },

    {
      value: "ແມັດ",
      meaning: "ຫົວໜ່ວຍວັດແທກຄວາມຍາວ"
    },

    {
      value: "ມ3",
      meaning: "ຫົວໜ່ວຍວັດແທກປະລິມານ (ແມັດກ້ອນ)"
    },

    {
      value: "ມ2",
      meaning: "ຫົວໜ່ວຍວັດແທກເນື້ອທີ່ (ຕາແມັດ)"
    },

    {
      value: "ຊຸດ",
      meaning: "ຫົວໜ່ວຍນັບເປັນຊຸດ"
    },

    {
      value: "ໂຫຼ",
      meaning: "ຫົວໜ່ວຍນັບເປັນໂຫຼ (12 ອັນ)"
    },

    {
      value: "ຄູ່",
      meaning: "ຫົວໜ່ວຍນັບເປັນຄູ່"
    },

    {
      value: "ຜືນ",
      meaning: "ຫົວໜ່ວຍນັບແຜ່ນຜ້າ ຫຼື ເສື່ອ"
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
      meaning: "ຫົວໜ່ວຍນັບເຄື່ອງຈັກ ຫຼື ອຸປະກອນ"
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
  // LOAD SUPPLIERS
  // =====================================================

  const loadSuppliers =
    useCallback(async () => {

      try {

        const res =
          await fetch(
            `${API}/suppliers`,
            {
              method: "GET",

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
          Array.isArray(result.data)
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
  // LOAD IMPORT
  // =====================================================

  const loadData =
    useCallback(async () => {

      try {

        const res =
          await fetch(
            `${API}/imports`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        const result =
          await res.json();


        if (!res.ok) {

          throw new Error(
            result.message ||
            "Load imports failed"
          );

        }


        if (
          result &&
          Array.isArray(result.data)
        ) {

          setList(
            result.data
          );

          return;

        }


        if (
          Array.isArray(result)
        ) {

          setList(result);

          return;

        }


        setList([]);


      } catch (err) {

        console.error(
          "LOAD IMPORTS ERROR:",
          err
        );

        setList([]);

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
  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // =====================================================

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          unitDropdownRef.current &&
          !unitDropdownRef.current.contains(
            event.target
          )
        ) {

          setShowUnitList(
            false
          );

        }


        if (
          supplierDropdownRef.current &&
          !supplierDropdownRef.current.contains(
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
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setEditId(null);

    setFiles({});

    setOldFiles({});

    setDocType(
      "invoice_file"
    );

    setShowSupplierList(false);

    setShowUnitList(false);


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
              ) ||

            item.meaning
              .toLowerCase()
              .includes(
                unitKeyword
              )

          );

        }
      )
      .slice(
        0,
        5
      );


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
          !Number.isFinite(qty) ||
          qty <= 0
        ) {

          alert(
            "ຈຳນວນສິນຄ້າຕ້ອງຫຼາຍກວ່າ 0"
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

          Number.isFinite(
            unitWeight
          )
            ? unitWeight
            : ""
        );


        formData.append(
          "weight",

          Number.isFinite(
            weight
          )
            ? weight
            : ""
        );


        formData.append(
          "unit_price",
          numberValue(
            unitPrice
          )
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


        Object.entries(files)
          .forEach(
            ([key, file]) => {

              if (!file) {

                return;

              }


              formData.append(
                key,
                file
              );

            }
          );


        let url =
          `${API}/imports`;

        let method =
          "POST";


        if (editId) {

          url =
            `${API}/imports/${editId}`;

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
          "Import save error:",
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
          "ຢືນຢັນການລຶບ ?"
        )
      ) {

        return;

      }


      try {

        const res =
          await fetch(
            `${API}/imports/${id}`,
            {
              method: "DELETE",

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
          "Delete import error:",
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
          item.qty !== null &&
          item.qty !== undefined
            ? formatNumberInput(
                item.qty
              )
            : "",

        unit:
          item.unit || "",

        unit_weight:
          item.unit_weight !== null &&
          item.unit_weight !== undefined
            ? formatNumberInput(
                item.unit_weight
              )
            : "",

        weight:
          item.weight !== null &&
          item.weight !== undefined
            ? formatNumberInput(
                item.weight
              )
            : "",

        unit_price:
          calculatedUnitPrice
            ? formatNumberInput(
                calculatedUnitPrice
              )
            : "",

        total_price:
          item.total_price !== null &&
          item.total_price !== undefined
            ? formatNumberInput(
                item.total_price
              )
            : "",

        supplier:
          item.supplier || "",

        invoice_date:
          item.invoice_date || ""

      });


      setOldFiles({

        invoice_file:
          item.invoice_file || "",

        acdd_file:
          item.acdd_file || "",

        formd_file:
          item.formd_file || "",

        truck_file:
          item.truck_file || "",

        payment_file:
          item.payment_file || "",

        fda_file:
          item.fda_file || "",

        import_license_file:
          item.import_license_file || ""

      });


      setFiles({});


      setDocType(
        "invoice_file"
      );


      setShowSupplierList(
        false
      );


      setShowUnitList(
        false
      );


      window.scrollTo({

        top: 0,

        behavior: "smooth"

      });

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

            const searchFields = [

              item.invoice_no,

              item.product_code,

              item.product_name,

              item.supplier,

              item.invoice_file,

              item.acdd_file,

              item.formd_file,

              item.truck_file,

              item.payment_file,

              item.fda_file,

              item.import_license_file

            ];


            return searchFields.some(
              (value) =>

                String(
                  value ?? ""
                )
                  .trim()
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

      if (!file) {

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
          value={
            form.invoice_no
          }
          onChange={(e) =>
            setForm({
              ...form,
              invoice_no:
                e.target.value
            })
          }
        />


        <input
          placeholder="Product Number (ตัวเลขเท่านั้น)"
          inputMode="numeric"
          pattern="[0-9]*"
          value={
            form.product_code
          }
          onChange={(e) =>
            setForm({
              ...form,
              product_code:
                e.target.value.replace(
                  /\D/g,
                  ""
                )
            })
          }
        />


        <input
          placeholder="ຊື່ສິນຄ້າ"
          value={
            form.product_name
          }
          onChange={(e) =>
            setForm({
              ...form,
              product_name:
                e.target.value
            })
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


        {/* UNIT SEARCHABLE DROPDOWN */}

        <div
          ref={
            unitDropdownRef
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
            setForm({
              ...form,

              unit_weight:
                formatNumberInput(
                  e.target.value
                )
            })
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
            setForm({
              ...form,

              weight:
                formatNumberInput(
                  e.target.value
                )
            })
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
            supplierDropdownRef
          }
          style={{
            position:
              "relative"
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
                  position:
                    "absolute",

                  width:
                    "100%",

                  background:
                    "#fff",

                  border:
                    "1px solid #ccc",

                  maxHeight:
                    "180px",

                  overflowY:
                    "auto",

                  zIndex:
                    9999
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


                      if (!name) {

                        return null;

                      }


                      return (

                        <div
                          key={
                            item.id
                          }
                          style={{
                            padding:
                              "10px",

                            cursor:
                              "pointer"
                          }}
                          onMouseDown={(
                            e
                          ) => {

                            e.preventDefault();


                            setForm({

                              ...form,

                              supplier:
                                name

                            });


                            setShowSupplierList(
                              false
                            );

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
            setForm({
              ...form,
              invoice_date:
                e.target.value
            })
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


      {/* DOCUMENTS */}

      <div
        className="card"
        style={{
          marginTop:
            "20px"
        }}
      >

        <h3>
          📎 ເອກະສານນຳເຂົ້າ
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

            const file =
              e.target.files?.[0];


            if (!file) {

              return;

            }


            setFiles({

              ...files,

              [docType]:
                file

            });


            e.target.value =
              "";

          }}
        />


        <div
          style={{
            marginTop:
              "15px"
          }}
        >

          {Object.keys(files)
            .length === 0 &&

          Object.values(oldFiles)
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
              ).map(
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
                          type
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


      {/* SEARCH */}

      <div
        className="card"
        style={{
          marginTop:
            "20px"
        }}
      >

        <h3>
          🔍 ຄົ້ນຫາ
        </h3>


        <input
          placeholder="ຄົ້ນຫາ Invoice / ສິນຄ້າ / Supplier"
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


      {/* TABLE */}

      <div
        className="card"
        style={{
          marginTop:
            "20px"
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

              <th>
                ID
              </th>

              <th>
                Invoice
              </th>

              <th>
                ສິນຄ້າ
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
                ເອກະສານ
              </th>

              <th>
                ຈັດການ
              </th>

            </tr>

          </thead>


          <tbody>

            {search.trim() === "" ? (

              <tr>

                <td
                  colSpan="10"
                  align="center"
                >

                  ພິມ Invoice
                  ເພື່ອຄົ້ນຫາ

                </td>

              </tr>

            ) : filtered.length === 0 ? (

              <tr>

                <td
                  colSpan="10"
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

                      <strong>
                        {item.product_code ||
                          "-"}
                      </strong>

                      <br />

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

                            📄 FORMD

                          </a>

                          <br />

                        </>

                      )}


                      {item.truck_file && (

                        <>

                          <a
                            href={
                              getFileUrl(
                                item.truck_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.payment_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.fda_file
                              )
                            }
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
                            href={
                              getFileUrl(
                                item.import_license_file
                              )
                            }
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


export default ImportInvoice;