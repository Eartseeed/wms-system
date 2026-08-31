const ReportService = require("../services/reportService");


// =====================================================
// REPORT CONTROLLER
// =====================================================

class ReportController {


    // =================================================
    // STOCK REPORT
    // GET /api/reports/stock
    // =================================================

    async stockReport(req, res) {

        try {

            const data =
                await ReportService.stockReport();


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            return res.json({

                success: true,

                total:
                    rows.length,

                data:
                    rows

            });

        } catch (err) {

            console.error(
                "Report stockReport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load stock report"

            });

        }

    }


    // =================================================
    // MOVEMENT REPORT
    // GET /api/reports/movement
    //
    // Query:
    // ?startDate=YYYY-MM-DD
    // &endDate=YYYY-MM-DD
    // =================================================

    async movementReport(req, res) {

        try {

            const startDate =
                req.query.startDate ||
                null;


            const endDate =
                req.query.endDate ||
                null;


            const data =
                await ReportService.movementReport(

                    startDate,

                    endDate

                );


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            return res.json({

                success: true,

                total:
                    rows.length,

                data:
                    rows

            });

        } catch (err) {

            console.error(
                "Report movementReport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load movement report"

            });

        }

    }


    // =================================================
    // IMPORT REPORT
    // GET /api/reports/import
    //
    // Query:
    // ?startDate=YYYY-MM-DD
    // &endDate=YYYY-MM-DD
    // =================================================

    async importReport(req, res) {

        try {

            const startDate =
                req.query.startDate ||
                null;


            const endDate =
                req.query.endDate ||
                null;


            const data =
                await ReportService.importReport(

                    startDate,

                    endDate

                );


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            return res.json({

                success: true,

                total:
                    rows.length,

                data:
                    rows

            });

        } catch (err) {

            console.error(
                "Report importReport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load import report"

            });

        }

    }


    // =================================================
    // EXPORT REPORT
    // GET /api/reports/export
    //
    // Query:
    // ?startDate=YYYY-MM-DD
    // &endDate=YYYY-MM-DD
    // =================================================

    async exportReport(req, res) {

        try {

            const startDate =
                req.query.startDate ||
                null;


            const endDate =
                req.query.endDate ||
                null;


            const data =
                await ReportService.exportReport(

                    startDate,

                    endDate

                );


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            return res.json({

                success: true,

                total:
                    rows.length,

                data:
                    rows

            });

        } catch (err) {

            console.error(
                "Report exportReport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load export report"

            });

        }

    }


    // =================================================
    // INVENTORY VALUE
    // GET /api/reports/inventory-value
    // =================================================

    async inventoryValue(req, res) {

        try {

            const data =
                await ReportService.inventoryValue();


            return res.json({

                success: true,

                data:
                    data || null

            });

        } catch (err) {

            console.error(
                "Report inventoryValue error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load inventory value"

            });

        }

    }

}


// =====================================================
// EXPORT CONTROLLER INSTANCE
// =====================================================

module.exports =
    new ReportController();