// =========================================================
// CWMS IMPORT ITEMS SCHEMA
//
// File:
// backend/database/schema/importItems.js
//
// สถานะ:
// LEGACY / NOT USED
//
// =========================================================
//
// IMPORTANT:
//
// ระบบ CWMS รุ่นปัจจุบันไม่ได้ใช้ import_items แล้ว
//
// Flow ปัจจุบัน:
//
// Import Invoice
//      ↓
// imports
//      ↓
// Stock
//      ↓
// Dashboard
//
// ข้อมูลรายการสินค้า Import เช่น:
//
// - Product Code
// - Product Name
// - Product Type
// - Qty
// - Unit
// - Unit Weight
// - Weight
// - Unit Price
// - Total Price
//
// ถูกเก็บใน Table:
//
//     imports
//
// ไม่แยกออกมาเป็น:
//
//     import_items
//
// =========================================================
//
// ห้ามสร้าง Table import_items ใหม่
//
// init.js รุ่นปัจจุบันจึงไม่เรียกไฟล์นี้
//
// =========================================================


async function createImportItems() {

    // -----------------------------------------------------
    // ไม่สร้าง Table import_items
    //
    // เก็บฟังก์ชันไว้เพื่อรองรับ code เก่าที่อาจ require
    // ไฟล์นี้อยู่ แต่จะไม่สร้าง Table เพิ่ม
    // -----------------------------------------------------

    console.log(
        "ℹ import_items is legacy and is not used"
    );

}


// =========================================================
// EXPORT
// =========================================================

module.exports = createImportItems;