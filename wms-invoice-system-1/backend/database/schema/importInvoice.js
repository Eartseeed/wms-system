// =========================================================
// CWMS IMPORT INVOICE SCHEMA
//
// File:
// backend/database/schema/importInvoice.js
//
// สถานะ:
// LEGACY / COMPATIBILITY
//
// =========================================================
//
// IMPORTANT:
//
// Flow ปัจจุบันของ Import ใช้ Table:
//
//     imports
//
// เป็น Table หลักเพียงตัวเดียว
//
// ไม่ใช้:
//
//     import_invoice
//
// เพราะข้อมูล Invoice + รายการสินค้า + Product Type
// + Qty + Weight + Price + Supplier
// ถูกเก็บใน:
//
//     imports
//
// ไฟล์นี้จึงไม่สร้าง Table import_invoice ใหม่
//
// =========================================================


async function createImportInvoice() {

    // -----------------------------------------------------
    // LEGACY TABLE
    //
    // ไม่สร้าง import_invoice เพิ่ม
    //
    // เหตุผล:
    // ป้องกันข้อมูล Import ถูกแยกไปอยู่คนละ Table
    // และป้องกัน Backend ใช้ Table ผิดตัว
    // -----------------------------------------------------

    console.log(
        "ℹ import_invoice is legacy and is not used"
    );

}


// =========================================================
// EXPORT
// =========================================================

module.exports = createImportInvoice;