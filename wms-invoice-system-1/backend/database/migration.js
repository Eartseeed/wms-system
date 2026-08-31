const {
    initializeDatabase,
    migrateDatabase
} = require("./init");


// =========================================================
// RUN MIGRATION
// =========================================================

async function runMigration() {

    try {

        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "CWMS Database Migration"
        );

        console.log(
            "===================================="
        );


        // -------------------------------------------------
        // สร้าง Table ที่ยังไม่มี
        // -------------------------------------------------

        await initializeDatabase();


        // -------------------------------------------------
        // ตรวจ Schema อีกครั้ง
        // -------------------------------------------------

        await migrateDatabase();


        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "Migration Success"
        );

        console.log(
            "===================================="
        );


        process.exit(0);

    } catch (error) {

        console.error("");
        console.error(
            "===================================="
        );

        console.error(
            "Migration Failed"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        process.exit(1);

    }

}


runMigration();