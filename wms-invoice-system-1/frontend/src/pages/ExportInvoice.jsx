// =========================================================
// CWMS - EXPORT INVOICE
//
// File:
// frontend/src/pages/ExportInvoice.jsx
//
// IMPORTANT
// - UI follows ImportInvoice style
// - Export keeps existing API
// - Import Invoice number can be searched
// - Import Invoice data can contain multiple product rows
// - Export can contain multiple product rows
// - Each product row is saved through existing /exports API
// - Stock reduction remains handled by backend ExportService
// - No Product Master
// - CSS is separated into ExportInvoice.css
// =========================================================

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { API } from "../config/api";

// =========================================================
// UNIT MASTER
// =========================================================

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

// =========================================================
// PRODUCT TYPE MASTER - same as ImportInvoice
// =========================================================

const PRODUCT_TYPE_OPTIONS = [
  {
    value: "4A",
    meaning: "ກ່ອງເຫລັກ"
  },
  {
    value: "4B",
    meaning: "ກອງອາລູມີນຽມ"
  },
  {
    value: "4C",
    meaning: "ກ່ອງໄມ້"
  },
  {
    value: "4D",
    meaning: "ກ່ອງໄມ້ອັດ"
  },
  {
    value: "4G",
    meaning: "ກ່ອງໄຟເບີ໊"
  },
  {
    value: "4H",
    meaning: "ກ່ອງປາດສຕິກ"
  },
  {
    value: "BC",
    meaning: "ຫລັ່ງ"
  },
  {
    value: "BG",
    meaning: "ຖົງ"
  },
  {
    value: "BK",
    meaning: "ກະຕ່າ"
  },
  {
    value: "BO",
    meaning: "ແກ້ວ"
  },
  {
    value: "BW",
    meaning: "ກ່ອງສຳລັບຂອງແຫລວ"
  },
  {
    value: "BX",
    meaning: "ກ່ອງ"
  },
  {
    value: "CS",
    meaning: "ແກັດ"
  },
  {
    value: "NE",
    meaning: "ບໍ່ໄດ້ຫຸ້ມຫໍ່"
  },
  {
    value: "QS",
    meaning: "ກ່ອງສຳລັບຂອງແຂງ"
  },
  {
    value: "RO",
    meaning: "ກໍ້"
  },
  {
    value: "SK",
    meaning: "ເປົາ"
  },
  {
    value: "TG",
    meaning: "ຖັງສີຫລ່ຽມຍາວ"
  },
  {
    value: "TK",
    meaning: "ຖັງສີ່ຫລ່ຽມມົນທົນ"
  },
  {
    value: "TY",
    meaning: "ຖັງກົມຍາວ"
  },
  {
    value: "VL",
    meaning: "ກອງຂອງແຫລວ"
  },
  {
    value: "VR",
    meaning: "ກອງຂອງແຂງ"
  }
];


// =========================================================
// CREATE EMPTY FORM
// =========================================================

function createEmptyForm() {
  return {
    invoice_no: "",
    invoice_date: "",
    supplier: ""
  };
}

// =========================================================
// CREATE EMPTY ITEM
// =========================================================

function createEmptyItem() {
  return {
    product_code: "",
    product_name: "",
    product_type: "",
    qty: "",
    unit: "",
    weight: "",
    unit_weight: "",
    total_price: "",
    unit_price: ""
  };
}

// =========================================================
// NUMBER HELPERS
// =========================================================

function numberValue(value) {
  const clean = String(value ?? "")
    .replace(/,/g, "")
    .trim();

  if (
    clean === "" ||
    clean === "."
  ) {
    return NaN;
  }

  const number = Number(clean);

  return Number.isFinite(number)
    ? number
    : NaN;
}

// =========================================================
// FORMAT NUMBER INPUT
// =========================================================

function formatNumberInput(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  let clean = String(value)
    .replace(/,/g, "")
    .replace(/[^0-9.]/g, "");

  const firstDot = clean.indexOf(".");

  if (firstDot !== -1) {
    clean =
      clean.slice(
        0,
        firstDot + 1
      ) +
      clean
        .slice(firstDot + 1)
        .replace(/\./g, "");
  }

  if (clean === "") {
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
    ).toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 0
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
}

// =========================================================
// FORMAT NUMBER DISPLAY
// =========================================================

function formatNumberDisplay(
  value,
  decimals = 2
) {
  const number =
    numberValue(value);

  if (
    !Number.isFinite(number)
  ) {
    return "-";
  }

  return number.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits:
        decimals
    }
  );
}

// =========================================================
// CALCULATE UNIT WEIGHT
// =========================================================

function calculateUnitWeight(
  qty,
  weight
) {
  const q =
    numberValue(qty);

  const totalWeight =
    numberValue(weight);

  if (
    !Number.isFinite(q) ||
    q <= 0
  ) {
    return "";
  }

  if (
    !Number.isFinite(
      totalWeight
    ) ||
    totalWeight < 0
  ) {
    return "";
  }

  return (
    totalWeight / q
  ).toFixed(4);
}

// =========================================================
// CALCULATE UNIT PRICE
// =========================================================

function calculateUnitPrice(
  qty,
  totalPrice
) {
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
}

// =========================================================
// COMPONENT
// =========================================================

function ExportInvoice() {

  const token =
    localStorage.getItem(
      "token"
    );

  // =======================================================
  // REF
  // =======================================================

  const pageRef =
    useRef(null);

  const invoiceDateInputRef =
    useRef(null);

  // =======================================================
  // STATE
  // =======================================================

  const [list, setList] =
    useState([]);

  const [suppliers, setSuppliers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [invoiceSearch, setInvoiceSearch] =
    useState("");

  const [editId, setEditId] =
    useState(null);

  const [
    showSupplierSuggestions,
    setShowSupplierSuggestions
  ] = useState(false);

  const [activeUnitRow, setActiveUnitRow] =
    useState(null);

  const [activeProductTypeRow, setActiveProductTypeRow] =
    useState(null);

  const [form, setForm] =
    useState(
      createEmptyForm()
    );

  const [items, setItems] =
    useState([
      createEmptyItem()
    ]);

  const [files, setFiles] =
    useState({});

  const [, setOldFiles] =
    useState({});

  const [, setDocType] =
    useState("invoice_file");

  // =======================================================
  // CLOSE DROPDOWNS
  // =======================================================

  const closeAllDropdowns =
    useCallback(() => {

      setShowSupplierSuggestions(
        false
      );

      setActiveUnitRow(
        null
      );

    }, []);

  // =======================================================
  // DATE PICKER
  // =======================================================

  const openInvoiceDatePicker =
    useCallback(() => {

      const input =
        invoiceDateInputRef.current;

      if (!input) {
        return;
      }

      closeAllDropdowns();

      if (
        typeof input.showPicker ===
        "function"
      ) {

        try {

          input.showPicker();

          return;

        } catch {
          // Browser may reject showPicker.
        }

      }

      input.focus();

    }, [
      closeAllDropdowns
    ]);

  // =======================================================
  // CLICK OUTSIDE
  // =======================================================

  useEffect(() => {

    const handlePointerDown =
      (event) => {

        const root =
          pageRef.current;

        if (
          !root ||
          root.contains(
            event.target
          )
        ) {
          return;
        }

        closeAllDropdowns();

      };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "touchstart",
      handlePointerDown
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "touchstart",
        handlePointerDown
      );

    };

  }, [
    closeAllDropdowns
  ]);

  // =======================================================
  // LOAD EXPORT DATA
  // =======================================================

  const loadData =
    useCallback(
      async () => {

        try {

          const res =
            await fetch(
              `${API}/exports`,
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

        } catch (error) {

          console.error(
            "Load export error:",
            error
          );

          setList([]);

        }

      },
      [token]
    );

  // =======================================================
  // LOAD SUPPLIERS
  // =======================================================

  const loadSuppliers =
    useCallback(
      async () => {

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
            Array.isArray(
              result.data
            )
              ? result.data
              : []
          );

        } catch (error) {

          console.error(
            "Load suppliers error:",
            error
          );

          setSuppliers([]);

        }

      },
      [token]
    );

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadData();
    loadSuppliers();

  }, [
    loadData,
    loadSuppliers
  ]);

  // =======================================================
  // RESET
  // =======================================================

  const resetForm =
    () => {

      setEditId(null);

      setForm(
        createEmptyForm()
      );

      setItems([
        createEmptyItem()
      ]);

      setFiles({});

      setOldFiles({});

      setDocType(
        "invoice_file"
      );

      setInvoiceSearch("");

      closeAllDropdowns();

    };

  // =======================================================
  // FIND REGISTERED SUPPLIER
  // =======================================================

  const findRegisteredSupplier =
    (value) => {

      const keyword =
        String(
          value || ""
        )
          .trim()
          .toLowerCase();

      if (!keyword) {
        return null;
      }

      return (
        suppliers.find(
          (item) =>
            String(
              item.supplier_name ||
              ""
            )
              .trim()
              .toLowerCase() ===
            keyword
        ) || null
      );

    };

  // =======================================================
  // SELECT SUPPLIER
  // =======================================================

  const selectSupplier =
    (supplier) => {

      const name =
        String(
          supplier.supplier_name ||
          ""
        ).trim();

      setForm(
        (previous) => ({
          ...previous,
          supplier: name
        })
      );

      closeAllDropdowns();

    };

  // =======================================================
  // UPDATE ITEM
  // =======================================================

  const updateItem =
    (
      index,
      field,
      value
    ) => {

      setItems(
        (previous) => {

          const next =
            [...previous];

          const item =
            {
              ...next[index]
            };

          if (
            field === "qty"
          ) {

            item.qty =
              formatNumberInput(
                value
              );

            item.unit_weight =
              calculateUnitWeight(
                item.qty,
                item.weight
              );

            item.unit_price =
              calculateUnitPrice(
                item.qty,
                item.total_price
              );

          } else if (
            field === "weight"
          ) {

            item.weight =
              formatNumberInput(
                value
              );

            item.unit_weight =
              calculateUnitWeight(
                item.qty,
                item.weight
              );

          } else if (
            field === "total_price"
          ) {

            item.total_price =
              formatNumberInput(
                value
              );

            item.unit_price =
              calculateUnitPrice(
                item.qty,
                item.total_price
              );

          } else {

            item[field] =
              value;

          }

          next[index] =
            item;

          return next;

        }
      );

    };

  // =======================================================
  // ADD ITEM
  // =======================================================

  const addItem =
    () => {

      closeAllDropdowns();

      setItems(
        (previous) => [
          ...previous,
          createEmptyItem()
        ]
      );

    };

  // =======================================================
  // REMOVE ITEM
  // =======================================================

  const removeItem =
    (index) => {

      closeAllDropdowns();

      setItems(
        (previous) => {

          if (
            previous.length <= 1
          ) {

            return [
              createEmptyItem()
            ];

          }

          return previous.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          );

        }
      );

    };

  // =======================================================
  // SELECT UNIT
  // =======================================================

  const selectUnit =
    (
      rowIndex,
      unit
    ) => {

      updateItem(
        rowIndex,
        "unit",
        unit.value
      );

      closeAllDropdowns();

    };

  // =======================================================
  // SELECT PRODUCT TYPE
  // Same behavior as ImportInvoice
  // =======================================================

  const selectProductType =
    (
      rowIndex,
      productType
    ) => {

      updateItem(
        rowIndex,
        "product_type",
        productType.value
      );

      closeAllDropdowns();

    };


  // =======================================================
  // LOAD IMPORT INVOICE
  //
  // IMPORTANT
  //
  // Keep existing function:
  //
  // GET /imports/invoice/:invoiceNo
  //
  // Current backend may return:
  //
  // [
  //   {...},
  //   {...}
  // ]
  //
  // Therefore all Import rows are
  // converted into Export item rows.
  // =======================================================

  const loadInvoice =
    async () => {

      const invoiceNo =
        String(
          invoiceSearch || ""
        ).trim();

      if (!invoiceNo) {

        alert(
          "ກະລຸນາໃສ່ເລກ Invoice"
        );

        return;

      }

      try {

        closeAllDropdowns();

        const res =
          await fetch(
            `${API}/imports/invoice/${encodeURIComponent(
              invoiceNo
            )}`,
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

          alert(
            result.message ||
            "ບໍ່ພົບ Invoice"
          );

          return;

        }

        const rows =
          Array.isArray(
            result.data
          )
            ? result.data
            : result.data
              ? [result.data]
              : [];

        if (
          rows.length === 0
        ) {

          alert(
            "ບໍ່ພົບ Invoice"
          );

          return;

        }

        const first =
          rows[0];

        setForm({
          invoice_no:
            first.invoice_no ||
            invoiceNo,

          invoice_date:
            first.invoice_date ||
            "",

          supplier:
            first.supplier ||
            ""
        });

        setItems(
          rows.map(
            (data) => {

              const qty =
                data.qty !== null &&
                data.qty !== undefined
                  ? formatNumberInput(
                      data.qty
                    )
                  : "";

              const weight =
                data.weight !== null &&
                data.weight !== undefined
                  ? formatNumberInput(
                      data.weight
                    )
                  : "";

              const totalPrice =
                data.total_price !== null &&
                data.total_price !== undefined
                  ? formatNumberInput(
                      data.total_price
                    )
                  : "";

              return {

                product_code:
                  data.product_code ||
                  "",

                product_name:
                  data.product_name ||
                  "",

                product_type:
                  data.product_type ||
                  "",

                qty,

                unit:
                  data.unit ||
                  "",

                weight,

                unit_weight:
                  calculateUnitWeight(
                    qty,
                    weight
                  ),

                total_price:
                  totalPrice,

                unit_price:
                  calculateUnitPrice(
                    qty,
                    totalPrice
                  )

              };

            }
          )
        );

        setEditId(null);

        setFiles({});

        setOldFiles({});

        setDocType(
          "invoice_file"
        );

      } catch (error) {

        console.error(
          "Load import invoice error:",
          error
        );

        alert(
          "ບໍ່ສາມາດດຶງ Invoice ໄດ້: " +
          error.message
        );

      }

    };

  // =======================================================
  // SAVE
  // =======================================================

  const saveData =
    async () => {

      try {

        closeAllDropdowns();

        const invoiceNo =
          String(
            form.invoice_no ||
            ""
          ).trim();

        const invoiceDate =
          String(
            form.invoice_date ||
            ""
          ).trim();

        const supplierName =
          String(
            form.supplier ||
            ""
          ).trim();

        if (!invoiceNo) {

          alert(
            "ກະລຸນາໃສ່ເລກ Invoice"
          );

          return;

        }

        if (!invoiceDate) {

          alert(
            "ກະລຸນາເລືອກວັນທີ Invoice"
          );

          return;

        }

        const registeredSupplier =
          findRegisteredSupplier(
            supplierName
          );

        if (
          !registeredSupplier
        ) {

          alert(
            "Supplier ຕ້ອງເລືອກຈາກ Supplier ທີ່ລົງທະບຽນໄວ້"
          );

          return;

        }

        if (
          !Array.isArray(
            items
          ) ||
          items.length === 0
        ) {

          alert(
            "ກະລຸນາເພີ່ມລາຍການສິນຄ້າ"
          );

          return;

        }

        // -------------------------------------------------
        // VALIDATE ALL ITEMS FIRST
        // -------------------------------------------------

        for (
          let index = 0;
          index < items.length;
          index++
        ) {

          const item =
            items[index];

          const rowNumber =
            index + 1;

          if (
            !/^\d+$/.test(
              String(
                item.product_code ||
                ""
              ).trim()
            )
          ) {

            alert(
              `Product Number ແຖວ ${rowNumber} ຕ້ອງເປັນຕົວເລກເທົ່ານັ້ນ`
            );

            return;

          }

          if (
            !String(
              item.product_name ||
              ""
            ).trim()
          ) {

            alert(
              `ກະລຸນາໃສ່ຊື່ສິນຄ້າ ແຖວ ${rowNumber}`
            );

            return;

          }

          const qty =
            numberValue(
              item.qty
            );

          if (
            !Number.isFinite(
              qty
            ) ||
            qty <= 0
          ) {

            alert(
              `Qty ແຖວ ${rowNumber} ຕ້ອງຫຼາຍກວ່າ 0`
            );

            return;

          }

          if (
            !String(
              item.unit ||
              ""
            ).trim()
          ) {

            alert(
              `ກະລຸນາເລືອກ Unit ແຖວ ${rowNumber}`
            );

            return;

          }

          const weight =
            numberValue(
              item.weight
            );

          if (
            !Number.isFinite(
              weight
            ) ||
            weight < 0
          ) {

            alert(
              `ນ້ຳໜັກລວມ ແຖວ ${rowNumber} ບໍ່ຖືກຕ້ອງ`
            );

            return;

          }

          const totalPrice =
            numberValue(
              item.total_price
            );

          if (
            !Number.isFinite(
              totalPrice
            ) ||
            totalPrice < 0
          ) {

            alert(
              `ລາຄາລວມ ແຖວ ${rowNumber} ບໍ່ຖືກຕ້ອງ`
            );

            return;

          }

        }

        // -------------------------------------------------
        // SAVE EACH ITEM
        // -------------------------------------------------

        for (
          let index = 0;
          index < items.length;
          index++
        ) {

          const item =
            items[index];

          const qty =
            numberValue(
              item.qty
            );

          const weight =
            numberValue(
              item.weight
            );

          const totalPrice =
            numberValue(
              item.total_price
            );

          const unitWeight =
            calculateUnitWeight(
              qty,
              weight
            );

          const unitPrice =
            calculateUnitPrice(
              qty,
              totalPrice
            );

          const formData =
            new FormData();

          formData.append(
            "invoice_no",
            invoiceNo
          );

          formData.append(
            "invoice_date",
            invoiceDate
          );

          formData.append(
            "supplier",
            registeredSupplier.supplier_name
          );

          formData.append(
            "product_code",
            String(
              item.product_code ||
              ""
            ).trim()
          );

          formData.append(
            "product_name",
            String(
              item.product_name ||
              ""
            ).trim()
          );

          formData.append(
            "qty",
            qty
          );

          formData.append(
            "unit",
            item.unit
          );

          formData.append(
            "weight",
            Number.isFinite(
              weight
            )
              ? weight
              : 0
          );

          formData.append(
            "unit_weight",
            Number(
              unitWeight || 0
            )
          );

          formData.append(
            "total_price",
            totalPrice
          );

          formData.append(
            "unit_price",
            Number(
              unitPrice || 0
            )
          );

          Object.entries(
            files
          ).forEach(
            ([key, file]) => {

              if (file) {

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

          // Edit represents one existing row.
          if (
            editId
          ) {

            break;

          }

        }

        alert(
          editId
            ? "ແກ້ໄຂ Export Invoice ສຳເລັດ"
            : "ບັນທຶກ Export Invoice ສຳເລັດ"
        );

        resetForm();

        await loadData();

      } catch (error) {

        console.error(
          "Export save error:",
          error
        );

        alert(
          "ບັນທຶກບໍ່ສຳເລັດ: " +
          error.message
        );

      }

    };

  // =======================================================
  // DELETE
  // =======================================================

  const deleteData =
    async (id) => {

      if (
        !window.confirm(
          "ຢືນຢັນການລຶບ Export ?"
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

      } catch (error) {

        console.error(
          "Delete export error:",
          error
        );

        alert(
          "ລົບບໍ່ສຳເລັດ: " +
          error.message
        );

      }

    };

  // =======================================================
  // EDIT
  // =======================================================

  const editData =
    (item) => {

      closeAllDropdowns();

      setEditId(
        item.id
      );

      setForm({
        invoice_no:
          item.invoice_no ||
          "",

        invoice_date:
          item.invoice_date ||
          "",

        supplier:
          item.supplier ||
          ""
      });

      setItems([
        {
          product_code:
            item.product_code ||
            "",

          product_name:
            item.product_name ||
            "",

          qty:
            item.qty !== null &&
            item.qty !== undefined
              ? formatNumberInput(
                  item.qty
                )
              : "",

          unit:
            item.unit ||
            "",

          weight:
            item.weight !== null &&
            item.weight !== undefined
              ? formatNumberInput(
                  item.weight
                )
              : "",

          unit_weight:
            calculateUnitWeight(
              item.qty,
              item.weight
            ),

          total_price:
            item.total_price !== null &&
            item.total_price !== undefined
              ? formatNumberInput(
                  item.total_price
                )
              : "",

          unit_price:
            calculateUnitPrice(
              item.qty,
              item.total_price
            )
        }
      ]);

      setOldFiles({

        invoice_file:
          item.invoice_file ||
          "",

        payment_file:
          item.payment_file ||
          "",

        formd_file:
          item.formd_file ||
          "",

        phytos_file:
          item.phytos_file ||
          "",

        tax_file:
          item.tax_file ||
          "",

        export_license_file:
          item.export_license_file ||
          "",

        origin_file:
          item.origin_file ||
          "",

        acdd_file:
          item.acdd_file ||
          ""

      });

      setFiles({});

      setDocType(
        "invoice_file"
      );

      window.scrollTo({
        top: 0,
        behavior:
          "smooth"
      });

    };

  // =======================================================
  // SEARCH
  // =======================================================

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

              item.unit,

              item.supplier,

              item.invoice_file,

              item.payment_file,

              item.formd_file,

              item.phytos_file,

              item.tax_file,

              item.export_license_file,

              item.origin_file,

              item.acdd_file

            ];

            return fields.some(
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

  // =======================================================
  // TOTALS
  // =======================================================

  const totalQty =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          numberValue(
            item.qty
          ) || 0
        ),
      0
    );

  const totalWeight =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          numberValue(
            item.weight
          ) || 0
        ),
      0
    );

  const totalPrice =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          numberValue(
            item.total_price
          ) || 0
        ),
      0
    );

  // =======================================================
  // FILE URL
  // =======================================================

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

  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div
      ref={pageRef}
      className="cwms-export-page"
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            📤 Export Invoice
          </h1>

          <p className="dashboard-subtitle">
            Home / Export / Export Invoice
          </p>

        </div>

      </div>

      {/* ===================================================
          EXPORT FORM
      =================================================== */}

      <div className="panel cwms-export-panel">

        <div className="cwms-section-header">

          <div>

            <h2>
              📤 ຂໍ້ມູນສົ່ງອອກ
            </h2>

            <p>
              ດຶງຂໍ້ມູນຈາກ Import Invoice ແລະ ເລືອກສິນຄ້າທີ່ຈະສົ່ງອອກ
            </p>

          </div>

        </div>

        {/* =================================================
            IMPORT INVOICE SEARCH
        ================================================= */}

        <div className="cwms-export-invoice-source">

          <div className="cwms-form-field">

            <label>
              Import Invoice
              <span className="cwms-required">
                *
              </span>
            </label>

            <div className="cwms-inline-search">

              <input
                className="form-control"
                placeholder="ໃສ່ເລກ Invoice ຈາກ Import Invoice"
                value={
                  invoiceSearch
                }
                onChange={(e) =>
                  setInvoiceSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter"
                  ) {

                    loadInvoice();

                  }

                }}
              />

              <button
                type="button"
                className="cwms-btn cwms-btn-primary"
                onClick={
                  loadInvoice
                }
              >
                📥 ດຶງຂໍ້ມູນ
              </button>

            </div>

            <small className="cwms-help-text">
              ເລກ Invoice ນີ້ດຶງຈາກ Import Invoice ໂດຍກົງ
            </small>

          </div>

        </div>

        {/* =================================================
            HEADER FIELDS
        ================================================= */}

        <div className="cwms-export-header-grid">

          {/* Invoice */}

          <div className="cwms-form-field">

            <label>
              Invoice No
              <span className="cwms-required">
                *
              </span>
            </label>

            <input
              className="form-control"
              value={
                form.invoice_no
              }
              onChange={(e) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    invoice_no:
                      e.target.value
                  })
                )
              }
              placeholder="Invoice No"
            />

          </div>

          {/* Supplier */}

          <div className="cwms-form-field cwms-dropdown-field">

            <label>
              Supplier
              <span className="cwms-required">
                *
              </span>
            </label>

            <input
              className="form-control"
              value={
                form.supplier
              }
              placeholder="ພິມເພື່ອຄົ້ນຫາ Supplier"
              onFocus={() => {

                setShowSupplierSuggestions(
                  true
                );

                setActiveUnitRow(
                  null
                );

              }}
              onChange={(e) => {

                setForm(
                  (previous) => ({
                    ...previous,
                    supplier:
                      e.target.value
                  })
                );

                setShowSupplierSuggestions(
                  true
                );

              }}
            />

            {showSupplierSuggestions &&
              form.supplier !== "" && (

                <div className="cwms-dropdown cwms-supplier-dropdown">

                  {suppliers
                    .filter(
                      (item) =>
                        String(
                          item.supplier_name ||
                          ""
                        )
                          .toLowerCase()
                          .includes(
                            String(
                              form.supplier ||
                              ""
                            ).toLowerCase()
                          )
                    )
                    .slice(0, 8)
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
                            className="cwms-dropdown-option"
                            onMouseDown={(e) => {

                              e.preventDefault();

                              selectSupplier(
                                item
                              );

                            }}
                          >

                            <strong>
                              {name}
                            </strong>

                          </div>

                        );

                      }
                    )}

                  {suppliers.filter(
                    (item) =>
                      String(
                        item.supplier_name ||
                        ""
                      )
                        .toLowerCase()
                        .includes(
                          String(
                            form.supplier ||
                            ""
                          ).toLowerCase()
                        )
                  ).length === 0 && (

                    <div className="cwms-dropdown-empty">
                      ບໍ່ພົບ Supplier
                    </div>

                  )}

                </div>

              )}

          </div>

          {/* Date */}

          <div className="cwms-form-field">

            <label>
              Invoice Date
              <span className="cwms-required">
                *
              </span>
            </label>

            <input
              ref={
                invoiceDateInputRef
              }
              className="form-control"
              type="date"
              value={
                form.invoice_date
              }
              onChange={(e) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    invoice_date:
                      e.target.value
                  })
                )
              }
              onClick={
                openInvoiceDatePicker
              }
            />

          </div>

        </div>

        {/* ===================================================
            PRODUCT ITEMS
            =================================================== */}

        <div className="panel cwms-invoice-panel">

          <div className="cwms-section-header">

            <h3>
              🛒 ລາຍການສິນຄ້າ
            </h3>

          </div>

          <div className="cwms-table-wrapper">

            <table className="cwms-invoice-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    ລະຫັດສິນຄ້າ
                  </th>

                  <th>
                    ຊື່ສິນຄ້າ
                  </th>

                  <th>
                    ປະເພດສິນຄ້າ
                  </th>

                  <th>
                    ຈຳນວນ
                    <br />
                    (Qty)
                  </th>

                  <th>
                    ໜ່ວຍ
                    <br />
                    (Unit)
                  </th>

                  <th>
                    ນ້ຳໜັກລວມ
                    <br />
                    (kg)
                  </th>

                  <th>
                    ນ້ຳໜັກຕໍ່ໜ່ວຍ
                    <br />
                    (kg)
                  </th>

                  <th>
                    ລາຄາລວມ
                    <br />
                    (KIP)
                  </th>

                  <th>
                    ລາຄາຕໍ່ໜ່ວຍ
                    <br />
                    (KIP)
                  </th>

                  <th>
                    ຈັດການ
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (
                    item,
                    index
                  ) => {

                    // =========================================
                    // UNIT SEARCH
                    // =========================================

                    const unitKeyword =
                      String(
                        item.unit || ""
                      )
                        .trim()
                        .toLowerCase();

                    const filteredUnits =
                      UNIT_OPTIONS
                        .filter(
                          (unit) => {
                            if (
                              !unitKeyword
                            ) {
                              return true;
                            }

                            return (
                              unit.value
                                .toLowerCase()
                                .includes(
                                  unitKeyword
                                ) ||
                              unit.meaning
                                .toLowerCase()
                                .includes(
                                  unitKeyword
                                )
                            );
                          }
                        )
                        .slice(0, 6);

                    // =========================================
                    // PRODUCT TYPE SEARCH
                    // =========================================

                    const productTypeKeyword =
                      String(
                        item.product_type ||
                        ""
                      )
                        .trim()
                        .toLowerCase();

                    const filteredProductTypes =
                      PRODUCT_TYPE_OPTIONS
                        .filter(
                          (productType) => {
                            if (
                              !productTypeKeyword
                            ) {
                              return true;
                            }

                            return (
                              productType.value
                                .toLowerCase()
                                .includes(
                                  productTypeKeyword
                                ) ||
                              productType.meaning
                                .toLowerCase()
                                .includes(
                                  productTypeKeyword
                                )
                            );
                          }
                        )
                        .slice(0, 6);

                    return (
                      <tr
                        key={index}
                      >

                        {/* NUMBER */}

                        <td className="cwms-table-number">
                          {index + 1}
                        </td>

                        {/* PRODUCT CODE */}

                        <td>

                          <input
                            className="form-control cwms-table-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="P001"
                            value={
                              item.product_code
                            }
                            onFocus={
                              closeAllDropdowns
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "product_code",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        {/* PRODUCT NAME */}

                        <td>

                          <input
                            className="form-control cwms-table-input"
                            type="text"
                            placeholder="ຊື່ສິນຄ້າ"
                            value={
                              item.product_name
                            }
                            onFocus={
                              closeAllDropdowns
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "product_name",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        {/* PRODUCT TYPE */}

                        <td className="cwms-dropdown-cell">

                          <input
                            className="form-control cwms-table-input"
                            type="text"
                            placeholder="ພິມ Code / ຊື່ປະເພດ"
                            value={
                              item.product_type ||
                              ""
                            }
                            onFocus={() => {
                              setShowSupplierSuggestions(
                                false
                              );

                              setActiveUnitRow(
                                null
                              );

                              setActiveProductTypeRow(
                                index
                              );
                            }}
                            onChange={(e) => {
                              updateItem(
                                index,
                                "product_type",
                                e.target.value
                              );

                              setShowSupplierSuggestions(
                                false
                              );

                              setActiveUnitRow(
                                null
                              );

                              setActiveProductTypeRow(
                                index
                              );
                            }}
                          />

                          {activeProductTypeRow ===
                            index && (

                            <div
                              className="cwms-dropdown"
                              onMouseDown={(e) =>
                                e.stopPropagation()
                              }
                            >

                              {filteredProductTypes.length ===
                              0 ? (

                                <div className="cwms-dropdown-empty">
                                  ບໍ່ພົບປະເພດສິນຄ້າ
                                </div>

                              ) : (

                                filteredProductTypes.map(
                                  (
                                    productType
                                  ) => (

                                    <button
                                      type="button"
                                      className="cwms-dropdown-option cwms-dropdown-option-detail"
                                      key={
                                        productType.value
                                      }
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        selectProductType(
                                          index,
                                          productType
                                        );
                                      }}
                                    >

                                      <strong>
                                        {
                                          productType.value
                                        }
                                      </strong>

                                      <span>
                                        {
                                          productType.meaning
                                        }
                                      </span>

                                    </button>

                                  )
                                )

                              )}

                            </div>

                          )}

                        </td>

                        {/* QTY */}

                        <td>

                          <input
                            className="form-control cwms-table-input cwms-number-input"
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={
                              item.qty
                            }
                            onFocus={
                              closeAllDropdowns
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "qty",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        {/* UNIT */}

                        <td className="cwms-dropdown-cell">

                          <input
                            className="form-control cwms-table-input"
                            type="text"
                            placeholder="ພິມ Unit"
                            value={
                              item.unit || ""
                            }
                            onFocus={() => {
                              setShowSupplierSuggestions(
                                false
                              );

                              setActiveProductTypeRow(
                                null
                              );

                              setActiveUnitRow(
                                index
                              );
                            }}
                            onChange={(e) => {
                              updateItem(
                                index,
                                "unit",
                                e.target.value
                              );

                              setShowSupplierSuggestions(
                                false
                              );

                              setActiveProductTypeRow(
                                null
                              );

                              setActiveUnitRow(
                                index
                              );
                            }}
                          />

                          {activeUnitRow ===
                            index && (

                            <div
                              className="cwms-dropdown"
                              onMouseDown={(e) =>
                                e.stopPropagation()
                              }
                            >

                              {filteredUnits.length ===
                              0 ? (

                                <div className="cwms-dropdown-empty">
                                  ບໍ່ພົບ Unit
                                </div>

                              ) : (

                                filteredUnits.map(
                                  (unit) => (

                                    <button
                                      type="button"
                                      className="cwms-dropdown-option cwms-dropdown-option-detail"
                                      key={
                                        unit.value
                                      }
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        selectUnit(
                                          index,
                                          unit
                                        );
                                      }}
                                    >

                                      <strong>
                                        {
                                          unit.value
                                        }
                                      </strong>

                                      <span>
                                        {
                                          unit.meaning
                                        }
                                      </span>

                                    </button>

                                  )
                                )

                              )}

                            </div>

                          )}

                        </td>

                        {/* TOTAL WEIGHT */}

                        <td>

                          <input
                            className="form-control cwms-table-input cwms-number-input"
                            type="text"
                            inputMode="decimal"
                            placeholder="0.0000"
                            value={
                              item.weight
                            }
                            onFocus={
                              closeAllDropdowns
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "weight",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        {/* UNIT WEIGHT */}

                        <td>

                          <input
                            className="form-control cwms-table-input cwms-readonly-input"
                            type="text"
                            value={
                              item.unit_weight
                            }
                            readOnly
                          />

                        </td>

                        {/* TOTAL PRICE */}

                        <td>

                          <input
                            className="form-control cwms-table-input cwms-number-input"
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={
                              item.total_price
                            }
                            onFocus={
                              closeAllDropdowns
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "total_price",
                                e.target.value
                              )
                            }
                          />

                        </td>

                        {/* UNIT PRICE */}

                        <td>

                          <input
                            className="form-control cwms-table-input cwms-readonly-input"
                            type="text"
                            value={
                              item.unit_price
                            }
                            readOnly
                          />

                        </td>

                        {/* DELETE */}

                        <td className="cwms-table-action">

                          <button
                            type="button"
                            className="cwms-btn cwms-btn-danger"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                          >
                            🗑
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              ADD ITEM
              ================================================= */}

          <div className="cwms-add-item-row">

            <button
              type="button"
              className="cwms-btn cwms-btn-outline-success"
              onClick={addItem}
            >
              ＋ ເພີ່ມລາຍການສິນຄ້າ
            </button>

          </div>

          {/* =================================================
              SUMMARY
              ================================================= */}

          <div className="cwms-invoice-summary">

            <h4>
              ລວມທັງໝົດ
            </h4>

            <div className="cwms-summary-grid">

              <div className="cwms-summary-item">

                <span>
                  ຈຳນວນລວມ
                </span>

                <strong>
                  {
                    formatNumberDisplay(
                      totalQty
                    )
                  }
                </strong>

              </div>

              <div className="cwms-summary-item">

                <span>
                  ນ້ຳໜັກລວມ
                </span>

                <strong>
                  {
                    formatNumberDisplay(
                      totalWeight,
                      4
                    )
                  }
                  {" "}kg
                </strong>

              </div>

              <div className="cwms-summary-item cwms-summary-price">

                <span>
                  ລາຄາລວມທັງໝົດ
                </span>

                <strong>
                  {
                    formatNumberDisplay(
                      totalPrice
                    )
                  }
                  {" "}KIP
                </strong>

              </div>

            </div>

          </div>

          {/* =================================================
              BUTTONS
              ================================================= */}

          <div className="cwms-form-actions">

            <button
              type="button"
              className="cwms-btn cwms-btn-secondary"
              onClick={resetForm}
            >
              ຍົກເລີກ
            </button>

            <button
              type="button"
              className="cwms-btn cwms-btn-primary"
              onClick={saveData}
            >
              💾{" "}
              {
                editId
                  ? "ແກ້ໄຂຂໍ້ມູນ"
                  : "ບັນທຶກຂໍ້ມູນ"
              }
            </button>

          </div>

        </div>

      </div>


      {/* ===================================================
          SEARCH
      =================================================== */}

      <div className="panel cwms-export-panel cwms-search-panel">

        <div className="cwms-section-header">

          <div>

            <h2>
              🔍 ຄົ້ນຫາ Export
            </h2>

            <p>
              Invoice / Product Number / Product / Supplier
            </p>

          </div>

        </div>

        <input
          className="form-control"
          placeholder="ຄົ້ນຫາ Invoice / Product Number / Product / Supplier"
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

      {/* ===================================================
          RESULT TABLE
      =================================================== */}

      <div className="panel cwms-export-panel">

        <div className="cwms-section-header">

          <div>

            <h2>
              📋 ລາຍການ Export
            </h2>

            <p>
              ສະແດງຂໍ້ມູນ Export ທີ່ບັນທຶກແລ້ວ
            </p>

          </div>

        </div>

        <div className="cwms-table-wrapper">

          <table className="cwms-result-table">

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Invoice
                </th>

                <th>
                  Product Number
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
                    className="cwms-result-empty"
                  >
                    ພິມ Invoice / Product ເພື່ອຄົ້ນຫາ
                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="12"
                    className="cwms-result-empty"
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
                        {item.product_code ||
                          "-"}
                      </td>

                      <td>
                        {item.product_name ||
                          "-"}
                      </td>

                      <td>
                        {formatNumberDisplay(
                          item.qty
                        )}
                      </td>

                      <td>
                        {formatNumberDisplay(
                          item.weight,
                          4
                        )}
                      </td>

                      <td>
                        {formatNumberDisplay(
                          calculateUnitPrice(
                            item.qty,
                            item.total_price
                          ),
                          2
                        )}
                      </td>

                      <td>
                        {formatNumberDisplay(
                          item.total_price,
                          2
                        )}
                      </td>

                      <td>
                        {item.supplier ||
                          "-"}
                      </td>

                      <td>
                        {item.invoice_date ||
                          "-"}
                      </td>

                      {/* FILES */}

                      <td>

                        {item.invoice_file && (

                          <>
                            <a
                              className="cwms-file-link"
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
                              className="cwms-file-link"
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
                              className="cwms-file-link"
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
                              className="cwms-file-link"
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
                              className="cwms-file-link"
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
                              className="cwms-file-link"
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
                              className="cwms-file-link"
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

                          <a
                            className="cwms-file-link"
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

                        )}

                        {!item.invoice_file &&
                          !item.payment_file &&
                          !item.formd_file &&
                          !item.phytos_file &&
                          !item.tax_file &&
                          !item.export_license_file &&
                          !item.origin_file &&
                          !item.acdd_file &&
                          "-"}

                      </td>

                      {/* ACTION */}

                      <td className="cwms-result-actions">

                        <button
                          type="button"
                          className="cwms-btn cwms-btn-edit cwms-btn-small"
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
                          className="cwms-btn cwms-btn-danger cwms-btn-small"
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

    </div>

  );

}

export default ExportInvoice;