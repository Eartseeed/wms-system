// =========================================================
// CWMS - IMPORT INVOICE
//
// File:
// frontend/src/pages/ImportInvoice.jsx
//
// IMPORTANT
// - ใช้ API เดิม
// - ไม่แก้ Backend
// - ไม่แก้ Export Invoice
// - รองรับหลายรายการสินค้า
// - Unit ค้นหา/เลือกได้
// - Product Type ค้นหา/เลือกได้เหมือน Unit
// - Supplier ค้นหา/เลือกได้
// - กดที่อื่นแล้ว dropdown หาย
// - Upload เอกสารใช้ช่องเดียว
// - เก็บไฟล์ลง field เดิม
// - Unit Weight = Total Weight / Qty
// - Unit Price = Total Price / Qty
// - ไม่ส่ง Warehouse / Location / Rack / Shelf / Bin / Remark
// - Invoice Date: กดตรงไหนก็ได้ในช่องเพื่อเปิด Date Picker
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
    meaning: "ຫົວໜ່ວຍກຳລັງໄຟຟ້າ (ກິໂລໂວນແອມແປ)"
  },
  {
    value: "ແມັດ",
    meaning: "ຫົວໜ່ວຍວັດແທກຄວາມຍາວ"
  },
  {
    value: "ມ3",
    meaning: "ຫົວໜ່ວຍວັດແທກປະລິມາດ (ແມັດກ້ອນ)"
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

// =========================================================
// PRODUCT TYPE MASTER
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
// DOCUMENT TYPES
// =========================================================

const DOCUMENT_TYPES = [
  {
    key: "invoice_file",
    label: "Invoice"
  },
  {
    key: "acdd_file",
    label: "ACDD"
  },
  {
    key: "formd_file",
    label: "FORM D"
  },
  {
    key: "truck_file",
    label: "ໃບລົດ"
  },
  {
    key: "payment_file",
    label: "ໃບໂອນເງິນ"
  },
  {
    key: "fda_file",
    label: "ອຍ."
  },
  {
    key: "import_license_file",
    label: "Import License"
  }
];

// =========================================================
// EMPTY ITEM
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
// EMPTY FORM
// =========================================================

function createEmptyForm() {
  return {
    invoice_no: "",
    invoice_date: "",
    receive_date: "",
    supplier: ""
  };
}

// =========================================================
// NUMBER VALUE
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

  const parts = clean.split(".");

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

  if (firstDot !== -1) {
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
// UNIT WEIGHT
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
// UNIT PRICE
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

function ImportInvoice() {
  const token =
    localStorage.getItem("token");

  // =======================================================
  // ROOT
  // =======================================================

  const pageRef =
    useRef(null);

  // =======================================================
  // DATE INPUT REF
  // =======================================================

  const invoiceDateInputRef =
    useRef(null);

  // =======================================================
  // DATA
  // =======================================================

  const [
    list,
    setList
  ] = useState([]);

  const [
    suppliers,
    setSuppliers
  ] = useState([]);

  // =======================================================
  // SEARCH
  // =======================================================

  const [
    search,
    setSearch
  ] = useState("");

  // =======================================================
  // EDIT
  // =======================================================

  const [
    editId,
    setEditId
  ] = useState(null);

  // =======================================================
  // DROPDOWNS
  // =======================================================

  const [
    showSupplierSuggestions,
    setShowSupplierSuggestions
  ] = useState(false);

  const [
    activeUnitRow,
    setActiveUnitRow
  ] = useState(null);

  const [
    activeProductTypeRow,
    setActiveProductTypeRow
  ] = useState(null);

  // =======================================================
  // FORM
  // =======================================================

  const [
    form,
    setForm
  ] = useState(
    createEmptyForm()
  );

  // =======================================================
  // ITEMS
  // =======================================================

  const [
    items,
    setItems
  ] = useState([
    createEmptyItem()
  ]);

  // =======================================================
  // FILES
  // =======================================================

  const [
    files,
    setFiles
  ] = useState({});

  const [
    oldFiles,
    setOldFiles
  ] = useState({});

  const [
    docType,
    setDocType
  ] = useState(
    "invoice_file"
  );

  // =======================================================
  // CLOSE DROPDOWNS
  // =======================================================

  const closeAllDropdowns =
    useCallback(() => {
      setShowSupplierSuggestions(false);
      setActiveUnitRow(null);
      setActiveProductTypeRow(null);
    }, []);

  // =======================================================
  // OPEN DATE PICKER
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
        } catch  {
          // Browser may reject showPicker
          // if the click is not considered
          // a valid user activation.
        }
      }

      input.focus();
    }, [closeAllDropdowns]);

  // =======================================================
  // CLICK OUTSIDE
  // =======================================================

  useEffect(() => {
    const handlePointerDown =
      (event) => {
        const root =
          pageRef.current;

        if (!root) {
          return;
        }

        if (
          !root.contains(
            event.target
          )
        ) {
          closeAllDropdowns();
        }
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
  }, [closeAllDropdowns]);

  // =======================================================
  // LOAD SUPPLIERS
  // =======================================================

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
    }, [token]);

  // =======================================================
  // LOAD IMPORT DATA
  // =======================================================

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
          Array.isArray(
            result?.data
          )
        ) {
          setList(result.data);
          return;
        }

        if (
          Array.isArray(result)
        ) {
          setList(result);
          return;
        }

        setList([]);
      } catch (error) {
        console.error(
          "LOAD IMPORTS ERROR:",
          error
        );

        setList([]);
      }
    }, [token]);

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

  const resetForm = () => {
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

    closeAllDropdowns();
  };

  // =======================================================
  // FIND REGISTERED SUPPLIER
  // =======================================================

  const findRegisteredSupplier =
    (value) => {
      const keyword =
        String(value || "")
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
  // UPDATE ITEM
  // =======================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((previous) => {
      const next = [
        ...previous
      ];

      const item = {
        ...next[index]
      };

      if (field === "qty") {
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
        item[field] = value;
      }

      next[index] = item;

      return next;
    });
  };

  // =======================================================
  // ADD ITEM
  // =======================================================

  const addItem = () => {
    closeAllDropdowns();

    setItems((previous) => [
      ...previous,
      createEmptyItem()
    ]);
  };

  // =======================================================
  // REMOVE ITEM
  // =======================================================

  const removeItem = (index) => {
    closeAllDropdowns();

    setItems((previous) => {
      if (previous.length <= 1) {
        return [
          createEmptyItem()
        ];
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
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

      setForm((previous) => ({
        ...previous,
        supplier: name
      }));

      closeAllDropdowns();
    };

  // =======================================================
  // SELECT UNIT
  // =======================================================

  const selectUnit = (
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
  // =======================================================

  const selectProductType = (
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
  // SAVE
  // =======================================================

  const saveData = async () => {
    try {
      closeAllDropdowns();

      const invoiceNo =
        String(
          form.invoice_no || ""
        ).trim();

      if (!invoiceNo) {
        alert(
          "ກະລຸນາໃສ່ເລກ Invoice"
        );
        return;
      }

      if (!form.invoice_date) {
        alert(
          "ກະລຸນາເລືອກວັນທີ Invoice"
        );
        return;
      }

      const supplierName =
        String(
          form.supplier || ""
        ).trim();

      const registeredSupplier =
        findRegisteredSupplier(
          supplierName
        );

      if (!registeredSupplier) {
        alert(
          "Supplier ຕ້ອງເລືອກຈາກ Supplier ທີ່ລົງທະບຽນໄວ້"
        );
        return;
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        alert(
          "ກະລຸນາເພີ່ມລາຍການສິນຄ້າ"
        );
        return;
      }

      // ===================================================
      // VALIDATE ITEMS
      // ===================================================

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item =
          items[index];

        if (
          !String(
            item.product_code ||
            ""
          ).trim()
        ) {
          alert(
            `ກະລຸນາໃສ່ Product Number ແຖວ ${index + 1}`
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
            `ກະລຸນາໃສ່ຊື່ສິນຄ້າ ແຖວ ${index + 1}`
          );
          return;
        }

        if (
          !String(
            item.product_type ||
            ""
          ).trim()
        ) {
          alert(
            `ກະລຸນາເລືອກປະເພດສິນຄ້າ ແຖວ ${index + 1}`
          );
          return;
        }

        const qty =
          numberValue(
            item.qty
          );

        if (
          !Number.isFinite(qty) ||
          qty <= 0
        ) {
          alert(
            `Qty ແຖວ ${index + 1} ຕ້ອງຫຼາຍກວ່າ 0`
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
            `ກະລຸນາເລືອກ Unit ແຖວ ${index + 1}`
          );
          return;
        }

        const totalWeight =
          numberValue(
            item.weight
          );

        if (
          !Number.isFinite(
            totalWeight
          ) ||
          totalWeight < 0
        ) {
          alert(
            `ນ້ຳໜັກລວມ ແຖວ ${index + 1} ບໍ່ຖືກຕ້ອງ`
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
            `ລາຄາລວມ ແຖວ ${index + 1} ບໍ່ຖືກຕ້ອງ`
          );
          return;
        }
      }

      // ===================================================
      // SAVE EACH ITEM
      // ===================================================

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

        // -------------------------------------------------
        // INVOICE
        // -------------------------------------------------

        formData.append(
          "invoice_no",
          invoiceNo
        );

        formData.append(
          "invoice_date",
          form.invoice_date
        );

        formData.append(
          "receive_date",
          form.receive_date
        );

        formData.append(
          "supplier",
          registeredSupplier.supplier_name
        );

        // -------------------------------------------------
        // PRODUCT
        // -------------------------------------------------

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
          "product_type",
          String(
            item.product_type ||
            ""
          ).trim()
        );

        // -------------------------------------------------
        // QTY / UNIT
        // -------------------------------------------------

        formData.append(
          "qty",
          qty
        );

        formData.append(
          "unit",
          item.unit
        );

        // -------------------------------------------------
        // WEIGHT
        // -------------------------------------------------

        formData.append(
          "weight",
          Number.isFinite(weight)
            ? weight
            : 0
        );

        formData.append(
          "unit_weight",
          Number(
            unitWeight || 0
          )
        );

        // -------------------------------------------------
        // PRICE
        // -------------------------------------------------

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

        // -------------------------------------------------
        // DOCUMENTS
        // -------------------------------------------------

        Object.entries(
          files
        ).forEach(
          ([
            key,
            file
          ]) => {
            if (!file) {
              return;
            }

            formData.append(
              key,
              file
            );
          }
        );

        // -------------------------------------------------
        // API
        // -------------------------------------------------

        let url =
          `${API}/imports`;

        let method =
          "POST";

        // -------------------------------------------------
        // EDIT
        // -------------------------------------------------

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

        // Edit = รายการเดียว
        if (editId) {
          break;
        }
      }

      alert(
        editId
          ? "ແກ້ໄຂ Import Invoice ສຳເລັດ"
          : "ບັນທຶກ Import Invoice ສຳເລັດ"
      );

      resetForm();

      await loadData();
    } catch (error) {
      console.error(
        "Import save error:",
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
          "ຢືນຢັນການລຶບ Import ?"
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
      } catch (error) {
        console.error(
          "Delete import error:",
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
          item.invoice_no || "",

        invoice_date:
          item.invoice_date || "",

        receive_date:
          item.receive_date ||
          item.invoice_date ||
          "",

        supplier:
          item.supplier || ""
      });

      setItems([
        {
          product_code:
            item.product_code || "",

          product_name:
            item.product_name || "",

          product_type:
            item.product_type || "",

          qty:
            item.qty !== null &&
            item.qty !== undefined
              ? formatNumberInput(
                  item.qty
                )
              : "",

          unit:
            item.unit || "",

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

      window.scrollTo({
        top: 0,
        behavior: "smooth"
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
              item.product_type,
              item.unit,
              item.supplier,
              item.invoice_file,
              item.acdd_file,
              item.formd_file,
              item.truck_file,
              item.payment_file,
              item.fda_file,
              item.import_license_file
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
      className="cwms-invoice-page"
    >

      {/* ===================================================
          PAGE HEADER
          =================================================== */}

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            📥 Import Invoice
          </h1>

          <p className="dashboard-subtitle">
            Home / Import / Import Invoice
          </p>

        </div>

      </div>

      {/* ===================================================
          INVOICE HEADER
          =================================================== */}

      <div className="panel cwms-invoice-panel">

        <div className="cwms-section-header">

          <h3>
            📄 ຂໍ້ມູນ Invoice
          </h3>

        </div>

        <div className="cwms-invoice-header-grid">

          {/* Invoice Number */}

          <div className="cwms-form-field">

            <label>
              ເລກທີ Invoice
              <span className="cwms-required">
                {" "}*
              </span>
            </label>

            <input
              className="form-control"
              type="text"
              placeholder="ກອກເລກທີ Invoice"
              value={
                form.invoice_no
              }
              onFocus={
                closeAllDropdowns
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
            />

          </div>

          {/* =================================================
              Invoice Date
              ================================================= */}

          <div
            className="cwms-form-field"
            onClick={(event) => {
              if (
                event.target ===
                invoiceDateInputRef.current
              ) {
                return;
              }

              openInvoiceDatePicker();
            }}
          >

            <label>
              ວັນທີ Invoice
              <span className="cwms-required">
                {" "}*
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
              onFocus={
                closeAllDropdowns
              }
              onClick={() => {
                closeAllDropdowns();
              }}
              onChange={(e) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    invoice_date:
                      e.target.value
                  })
                )
              }
            />

          </div>

          {/* Supplier */}

          <div className="cwms-form-field cwms-dropdown-field">

            <label>
              Supplier
              <span className="cwms-required">
                {" "}*
              </span>
            </label>

            <input
              className="form-control"
              type="text"
              placeholder="ພິມຊື່ Supplier ເພື່ອຄົ້ນຫາ"
              value={
                form.supplier
              }
              onFocus={() => {
                setActiveUnitRow(null);
                setActiveProductTypeRow(null);
                setShowSupplierSuggestions(true);
              }}
              onChange={(e) => {
                setForm(
                  (previous) => ({
                    ...previous,
                    supplier:
                      e.target.value
                  })
                );

                setActiveUnitRow(null);
                setActiveProductTypeRow(null);
                setShowSupplierSuggestions(true);
              }}
            />

            {showSupplierSuggestions && (

              <div
                className="cwms-dropdown"
                onMouseDown={(e) =>
                  e.stopPropagation()
                }
              >

                {suppliers
                  .filter(
                    (supplier) => {
                      const name =
                        String(
                          supplier.supplier_name ||
                          ""
                        ).trim();

                      const supplierKeyword =
                        String(
                          form.supplier ||
                          ""
                        )
                          .trim()
                          .toLowerCase();

                      if (
                        !supplierKeyword
                      ) {
                        return true;
                      }

                      return name
                        .toLowerCase()
                        .includes(
                          supplierKeyword
                        );
                    }
                  )
                  .slice(0, 10)
                  .map(
                    (supplier) => {
                      const name =
                        String(
                          supplier.supplier_name ||
                          ""
                        ).trim();

                      if (!name) {
                        return null;
                      }

                      return (
                        <button
                          type="button"
                          className="cwms-dropdown-option"
                          key={
                            supplier.id
                          }
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            selectSupplier(
                              supplier
                            );
                          }}
                        >
                          {name}
                        </button>
                      );
                    }
                  )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ===================================================
          DOCUMENTS
          =================================================== */}

      <div className="panel cwms-invoice-panel">

        <div className="cwms-section-header">

          <h3>
            📎 ເອກະສານແນບ
          </h3>

        </div>

        <div className="cwms-document-upload-grid">

          <div className="cwms-form-field">

            <label>
              ປະເພດເອກະສານ
            </label>

            <select
              className="form-control"
              value={
                docType
              }
              onFocus={
                closeAllDropdowns
              }
              onChange={(e) =>
                setDocType(
                  e.target.value
                )
              }
            >

              {DOCUMENT_TYPES.map(
                (document) => (
                  <option
                    key={
                      document.key
                    }
                    value={
                      document.key
                    }
                  >
                    {
                      document.label
                    }
                  </option>
                )
              )}

            </select>

          </div>

          <div className="cwms-form-field">

            <label>
              ອັບໂຫຼດເອກະສານ
            </label>

            <input
              className="form-control"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onFocus={
                closeAllDropdowns
              }
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (!file) {
                  return;
                }

                setFiles(
                  (previous) => ({
                    ...previous,
                    [docType]:
                      file
                  })
                );

                e.target.value = "";
              }}
            />

            <small className="cwms-help-text">
              PDF, JPG, JPEG, PNG
            </small>

          </div>

        </div>

        {/* NEW FILES */}

        {Object.entries(
          files
        ).map(
          ([
            type,
            file
          ]) => {
            const document =
              DOCUMENT_TYPES.find(
                (item) =>
                  item.key === type
              );

            return (
              <div
                key={type}
                className="cwms-file-row"
              >

                <div className="cwms-file-name">

                  📎{" "}

                  <strong>
                    {
                      document?.label ||
                      type
                    }
                  </strong>

                  {" : "}

                  {file?.name}

                </div>

                <button
                  type="button"
                  className="cwms-btn cwms-btn-danger cwms-btn-small"
                  onClick={() => {
                    setFiles(
                      (previous) => {
                        const next = {
                          ...previous
                        };

                        delete next[type];

                        return next;
                      }
                    );
                  }}
                >
                  ✕
                </button>

              </div>
            );
          }
        )}

        {/* OLD FILES */}

        {Object.entries(
          oldFiles
        )
          .filter(
            ([, file]) =>
              Boolean(file)
          )
          .map(
            ([
              type,
              file
            ]) => {
              const document =
                DOCUMENT_TYPES.find(
                  (item) =>
                    item.key === type
                );

              return (
                <div
                  key={`old-${type}`}
                  className="cwms-file-row"
                >

                  <a
                    className="cwms-file-link"
                    href={
                      getFileUrl(file)
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    📄{" "}

                    {
                      document?.label ||
                      type
                    }

                    {" : "}

                    {file}
                  </a>

                </div>
              );
            }
          )}

        {Object.keys(files).length === 0 &&
          Object.values(oldFiles)
            .filter(Boolean)
            .length === 0 && (

            <div className="cwms-empty-text">
              ຍັງບໍ່ມີເອກະສານ
            </div>

          )}

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

      {/* ===================================================
          SEARCH
          =================================================== */}

      <div className="panel cwms-invoice-panel cwms-search-panel">

        <div className="cwms-section-header">

          <h3>
            🔍 ຄົ້ນຫາ Import
          </h3>

        </div>

        <input
          className="form-control"
          type="text"
          placeholder="ຄົ້ນຫາ Invoice / ສິນຄ້າ / Supplier"
          value={search}
          onFocus={
            closeAllDropdowns
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

      <div className="panel cwms-invoice-panel">

        <div className="cwms-section-header">

          <h3>
            📋 ລາຍການ Import
          </h3>

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
                  ລະຫັດສິນຄ້າ
                </th>

                <th>
                  ຊື່ສິນຄ້າ
                </th>

                <th>
                  ປະເພດ
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Weight
                </th>

                <th>
                  Unit Weight
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
                  ຈັດການ
                </th>

              </tr>

            </thead>

            <tbody>

              {search.trim() === "" ? (

                <tr>

                  <td
                    colSpan="13"
                    className="cwms-result-empty"
                  >
                    ພິມຄຳຄົ້ນຫາເພື່ອສະແດງຂໍ້ມູນ
                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="13"
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
                        {item.product_code}
                      </td>

                      <td>
                        {item.product_name}
                      </td>

                      <td>
                        {
                          item.product_type ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          item.unit ||
                          "-"
                        }
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
                            item.weight,
                            4
                          )
                        }
                      </td>

                      <td>
                        {
                          formatNumberDisplay(
                            calculateUnitWeight(
                              item.qty,
                              item.weight
                            ),
                            4
                          )
                        }
                      </td>

                      <td>
                        {
                          formatNumberDisplay(
                            calculateUnitPrice(
                              item.qty,
                              item.total_price
                            )
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
                        {item.supplier}
                      </td>

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

export default ImportInvoice;