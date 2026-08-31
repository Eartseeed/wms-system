require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT =
    process.env.PORT ||
    3002;


// ======================================================
// CONFIG
// ======================================================

app.use(cors());

app.use(
    express.json({
        limit: "50mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb"
    })
);


// ======================================================
// UPLOAD FOLDER
// ======================================================

const uploadPath =
    path.join(
        __dirname,
        "uploads"
    );


if (
    !fs.existsSync(
        uploadPath
    )
) {

    fs.mkdirSync(
        uploadPath,
        {
            recursive: true
        }
    );

}


app.use(
    "/uploads",
    express.static(
        uploadPath
    )
);


// ======================================================
// DATABASE
// ======================================================

const db =
    require(
        "./config/database"
    );


const {
    initializeDatabase
} =
    require(
        "./database/init"
    );


// ======================================================
// ROUTES
// ======================================================

const authRoutes =
    require(
        "./routes/auth"
    );


const userRoutes =
    require(
        "./routes/users"
    );


const supplierRoutes =
    require(
        "./routes/suppliers"
    );


const customerRoutes =
    require(
        "./routes/customers"
    );


const stockRoutes =
    require(
        "./routes/stock"
    );


const movementRoutes =
    require(
        "./routes/movement"
    );


// ------------------------------------------------------
// IMPORT
// ------------------------------------------------------

const importRoutes =
    require(
        "./routes/imports"
    );


// ------------------------------------------------------
// EXPORT
// ------------------------------------------------------

const exportRoutes =
    require(
        "./routes/exports"
    );


// ------------------------------------------------------
// OTHER ROUTES
// ------------------------------------------------------

const reportRoutes =
    require(
        "./routes/reports"
    );


const dashboardRoutes =
    require(
        "./routes/dashboard"
    );


const uploadRoutes =
    require(
        "./routes/upload"
    );


const notificationRoutes =
    require(
        "./routes/notification"
    );


const settingRoutes =
    require(
        "./routes/settings"
    );


const backupRoutes =
    require(
        "./routes/backup"
    );


const syncRoutes =
    require(
        "./routes/sync"
    );


const networkRoutes =
    require(
        "./routes/network"
    );


// ======================================================
// API ROUTES
// ======================================================


// ------------------------------------------------------
// AUTH
// ------------------------------------------------------

app.use(
    "/api/auth",
    authRoutes
);


// ------------------------------------------------------
// USERS
// ------------------------------------------------------

app.use(
    "/api/users",
    userRoutes
);


// ------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------

// ------------------------------------------------------
// SUPPLIERS
// ------------------------------------------------------

app.use(
    "/api/suppliers",
    supplierRoutes
);


// ------------------------------------------------------
// CUSTOMERS
// ------------------------------------------------------

app.use(
    "/api/customers",
    customerRoutes
);


// ------------------------------------------------------
// STOCK
// ------------------------------------------------------

app.use(
    "/api/stock",
    stockRoutes
);


// ------------------------------------------------------
// MOVEMENT
// ------------------------------------------------------

app.use(
    "/api/movement",
    movementRoutes
);


// ------------------------------------------------------
// IMPORTS
// ------------------------------------------------------

app.use(
    "/api/imports",
    importRoutes
);


// ------------------------------------------------------
// EXPORTS
// ------------------------------------------------------

app.use(
    "/api/exports",
    exportRoutes
);


// ------------------------------------------------------
// REPORTS
// ------------------------------------------------------

app.use(
    "/api/reports",
    reportRoutes
);


// ------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------

app.use(
    "/api/dashboard",
    dashboardRoutes
);


// ------------------------------------------------------
// UPLOAD
// ------------------------------------------------------

app.use(
    "/api/upload",
    uploadRoutes
);


// ------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------

app.use(
    "/api/notifications",
    notificationRoutes
);


// ------------------------------------------------------
// SETTINGS
// ------------------------------------------------------

app.use(
    "/api/settings",
    settingRoutes
);


// ------------------------------------------------------
// BACKUP
// ------------------------------------------------------

app.use(
    "/api/backup",
    backupRoutes
);


// ------------------------------------------------------
// SYNC
// ------------------------------------------------------

app.use(
    "/api/sync",
    syncRoutes
);


// ------------------------------------------------------
// NETWORK
// ------------------------------------------------------

app.use(
    "/api/network",
    networkRoutes
);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "CWMS Backend API Running",

            version:
                "2.0.0",

            time:
                new Date()

        });

    }
);


app.get(
    "/api/health",
    (req, res) => {

        db.get(

            `
            SELECT
                datetime('now')
                AS server_time
            `,

            (err, row) => {

                if (err) {

                    return res
                        .status(500)
                        .json({

                            success: false,

                            message:
                                err.message

                        });

                }


                res.json({

                    success: true,

                    database:
                        "Connected",

                    server:
                        "Running",

                    serverTime:
                        row.server_time

                });

            }

        );

    }
);


// ======================================================
// 404 HANDLER
// ======================================================

app.use(
    (req, res) => {

        res
            .status(404)
            .json({

                success: false,

                message:
                    "API Not Found",

                path:
                    req.originalUrl

            });

    }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "==============================="
        );

        console.error(
            "SERVER ERROR"
        );

        console.error(
            err
        );

        console.error(
            "==============================="
        );


        res
            .status(
                err.status ||
                500
            )
            .json({

                success: false,

                message:
                    err.message ||
                    "Internal Server Error"

            });

    }
);


// ======================================================
// START SERVER
// ======================================================

async function startServer() {

    try {

        console.log("");

        console.log(
            "===================================="
        );

        console.log(
            " CWMS Backend Starting..."
        );

        console.log(
            "===================================="
        );


        // ------------------------------------------------
        // DATABASE
        // ------------------------------------------------

        await initializeDatabase();


        // ------------------------------------------------
        // SERVER
        // ------------------------------------------------

        app.listen(
            PORT,
            () => {

                console.log("");

                console.log(
                    "===================================="
                );

                console.log(
                    " Server Running"
                );

                console.log(
                    ` Port : ${PORT}`
                );

                console.log(
                    ` URL  : http://localhost:${PORT}`
                );

                console.log(
                    "===================================="
                );

                console.log("");

            }
        );

    } catch (error) {

        console.error("");

        console.error(
            "===================================="
        );

        console.error(
            " SERVER START FAILED"
        );

        console.error(
            "===================================="
        );

        console.error(
            error
        );

        process.exit(1);

    }

}


startServer();


// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

process.on(
    "SIGINT",
    () => {

        console.log("");

        console.log(
            "Closing Database..."
        );


        db.close(
            (err) => {

                if (err) {

                    console.error(
                        err
                    );

                } else {

                    console.log(
                        "Database Closed"
                    );

                }


                process.exit(
                    0
                );

            }
        );

    }
);


process.on(
    "SIGTERM",
    () => {

        console.log("");

        console.log(
            "Server Shutdown"
        );

        process.exit(
            0
        );

    }
);


// ======================================================
// EXPORT APP
// ======================================================

module.exports =
    app;