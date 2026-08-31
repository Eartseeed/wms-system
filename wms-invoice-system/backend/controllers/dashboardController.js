const DashboardService =
    require("../services/dashboardService");


// =====================================================
// DASHBOARD CONTROLLER
// =====================================================

class DashboardController {


    // =================================================
    // DASHBOARD
    // GET /api/dashboard/
    // =================================================

    async dashboard(req, res) {

        try {

            const data =
                await DashboardService.dashboard();


            return res.json(data);

        } catch (err) {

            console.error(
                "Dashboard error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load dashboard"

            });

        }

    }


    // =================================================
    // RECENT IMPORT
    // GET /api/dashboard/recent-import
    // =================================================

    async recentImport(req, res) {

        try {

            const data =
                await DashboardService.recentImport();


            return res.json(data);

        } catch (err) {

            console.error(
                "Dashboard recentImport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load recent imports"

            });

        }

    }


    // =================================================
    // RECENT EXPORT
    // GET /api/dashboard/recent-export
    // =================================================

    async recentExport(req, res) {

        try {

            const data =
                await DashboardService.recentExport();


            return res.json(data);

        } catch (err) {

            console.error(
                "Dashboard recentExport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load recent exports"

            });

        }

    }


    // =================================================
    // IMPORT PAGES
    // GET /api/dashboard/import-pages
    // =================================================

    async importPages(req, res) {

        try {

            const data =
                await DashboardService.importPages();


            return res.json(data);

        } catch (err) {

            console.error(
                "Dashboard importPages error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load import pages"

            });

        }

    }


    // =================================================
    // EXPORT PAGES
    // GET /api/dashboard/export-pages
    // =================================================

    async exportPages(req, res) {

        try {

            const data =
                await DashboardService.exportPages();


            return res.json(data);

        } catch (err) {

            console.error(
                "Dashboard exportPages error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load export pages"

            });

        }

    }


    // =================================================
    // SUMMARY
    // GET /api/dashboard/summary
    // =================================================

    async summary(req, res) {

        try {

            const data =
                await DashboardService.summary();


            return res.json({

                success: true,

                data:
                    data || {}

            });

        } catch (err) {

            console.error(
                "Dashboard summary error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load dashboard summary"

            });

        }

    }


    // =================================================
    // LOW STOCK
    // GET /api/dashboard/low-stock
    // =================================================

    async lowStock(req, res) {

        try {

            const data =
                await DashboardService.lowStock();


            return res.json({

                success: true,

                data:
                    Array.isArray(data)
                        ? data
                        : []

            });

        } catch (err) {

            console.error(
                "Dashboard lowStock error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load low stock"

            });

        }

    }


    // =================================================
    // RECENT MOVEMENTS
    // GET /api/dashboard/recent-movements
    // =================================================

    async recentMovements(req, res) {

        try {

            const data =
                await DashboardService.recentMovements();


            return res.json({

                success: true,

                data:
                    Array.isArray(data)
                        ? data
                        : []

            });

        } catch (err) {

            console.error(
                "Dashboard recentMovements error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load recent movements"

            });

        }

    }

}


// =====================================================
// EXPORT
// =====================================================

module.exports =
    new DashboardController();