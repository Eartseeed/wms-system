const {
    all,
    get,
    run
} = require("../config/database");


// =========================================================
// SYNC SERVICE
//
// PROGRAM 1 / PROGRAM 2 / PROGRAM 3
//
// FLOW
// Device
//    ↓
// SyncService.getChanges()
//    ↓
// Stock / Movements / Imports / Exports
//    ↓
// Main Server / Other Program
//
// IMPORTANT
// - ใช้ updated_at สำหรับข้อมูลที่ถูกแก้ไข
// - ใช้ created_at สำหรับ movement
// - sync_logs ใช้เก็บเวลาที่ sync สำเร็จ
// =========================================================

class SyncService {

    // =====================================================
    // GET LAST SYNC
    // =====================================================

    async getLastSync(deviceName = "") {

        const device =
            String(deviceName ?? "").trim();

        if (device) {

            return await get(`
                SELECT *
                FROM sync_logs
                WHERE device_name = ?
                ORDER BY sync_time DESC
                LIMIT 1
            `, [
                device
            ]);

        }

        return await get(`
            SELECT *
            FROM sync_logs
            ORDER BY sync_time DESC
            LIMIT 1
        `);
    }


    // =====================================================
    // GET CHANGES
    // =====================================================

    async getChanges(lastSync = null) {

        // -------------------------------------------------
        // ถ้าไม่มี Sync ครั้งก่อน
        // ให้ใช้วันที่เก่ามาก
        // เพื่อดึงข้อมูลทั้งหมด
        // -------------------------------------------------

        const syncTime =
            lastSync &&
            String(lastSync).trim()
                ? String(lastSync).trim()
                : "1970-01-01 00:00:00";


        // =================================================
        // STOCK
        // =================================================

        const stock =
            await all(`
                SELECT *
                FROM stock
                WHERE updated_at > ?
                ORDER BY updated_at ASC, id ASC
            `, [
                syncTime
            ]);


        // =================================================
        // STOCK MOVEMENTS
        // =================================================

        const movements =
            await all(`
                SELECT *
                FROM stock_movements
                WHERE created_at > ?
                ORDER BY created_at ASC, id ASC
            `, [
                syncTime
            ]);


        // =================================================
        // IMPORT
        // =================================================

        const imports =
            await all(`
                SELECT *
                FROM imports
                WHERE updated_at > ?
                ORDER BY updated_at ASC, id ASC
            `, [
                syncTime
            ]);


        // =================================================
        // EXPORT
        // =================================================

        const exports =
            await all(`
                SELECT *
                FROM export_invoice
                WHERE updated_at > ?
                ORDER BY updated_at ASC, id ASC
            `, [
                syncTime
            ]);


        return {

            lastSync:
                syncTime,

            stock,

            movements,

            imports,

            exports

        };
    }


    // =====================================================
    // SAVE SYNC LOG
    // =====================================================

    async saveSyncLog(deviceName) {

        const device =
            String(deviceName ?? "").trim();

        if (!device) {

            throw new Error(
                "Device name is required"
            );

        }


        return await run(`
            INSERT INTO sync_logs (
                device_name,
                sync_time
            )
            VALUES (
                ?,
                CURRENT_TIMESTAMP
            )
        `, [
            device
        ]);
    }


    // =====================================================
    // GET SYNC HISTORY
    // =====================================================

    async getHistory(deviceName = "") {

        const device =
            String(deviceName ?? "").trim();


        if (device) {

            return await all(`
                SELECT *
                FROM sync_logs
                WHERE device_name = ?
                ORDER BY sync_time DESC
                LIMIT 100
            `, [
                device
            ]);

        }


        return await all(`
            SELECT *
            FROM sync_logs
            ORDER BY sync_time DESC
            LIMIT 100
        `);
    }
}


// =========================================================
// EXPORT
// =========================================================

module.exports =
    new SyncService();