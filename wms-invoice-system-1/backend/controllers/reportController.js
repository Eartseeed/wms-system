const ExcelJS = require("exceljs");

const ReportService =
    require("../services/reportService");


// =====================================================
// REPORT CONTROLLER
// =====================================================

class ReportController {


    // =====================================================
    // EXCEL HELPER
    // =====================================================

    async sendExcel(
        res,
        filename,
        sheetName,
        rows
    ) {

        const workbook =
            new ExcelJS.Workbook();


        const worksheet =
            workbook.addWorksheet(
                sheetName
            );


        const data =
            Array.isArray(rows)
                ? rows
                : [];


        // =================================================
        // NO DATA
        // =================================================

        if (data.length === 0) {

            worksheet.addRow([
                "No data"
            ]);

        } else {

            // -------------------------------------------------
            // COLLECT ALL COLUMNS
            //
            // ไม่ใช้ Object.keys(data[0]) อย่างเดียว
            // เพราะบาง row อาจมี field เพิ่ม/ต่างกัน
            // -------------------------------------------------

            const columnSet =
                new Set();


            data.forEach(
                row => {

                    if (
                        row &&
                        typeof row === "object" &&
                        !Array.isArray(row)
                    ) {

                        Object.keys(row)
                            .forEach(
                                key =>
                                    columnSet.add(key)
                            );

                    }

                }
            );


            const columns =
                Array.from(
                    columnSet
                );


            // -------------------------------------------------
            // CREATE COLUMNS
            // -------------------------------------------------

            worksheet.columns =
                columns.map(
                    key => ({

                        header: key,
                        key: key,
                        width: 20

                    })
                );


            // -------------------------------------------------
            // ADD ROWS
            // -------------------------------------------------

            data.forEach(
                row => {

                    const values = {};


                    columns.forEach(
                        key => {

                            values[key] =
                                row?.[key] ?? "";

                        }
                    );


                    worksheet.addRow(
                        values
                    );

                }
            );


            // =================================================
            // HEADER
            // =================================================

            const headerRow =
                worksheet.getRow(1);


            headerRow.font = {
                bold: true
            };


            headerRow.alignment = {

                vertical: "middle",

                horizontal: "center",

                wrapText: true

            };


            headerRow.eachCell(
                cell => {

                    cell.border = {

                        top: {
                            style: "thin"
                        },

                        left: {
                            style: "thin"
                        },

                        bottom: {
                            style: "thin"
                        },

                        right: {
                            style: "thin"
                        }

                    };

                }
            );


            // =================================================
            // DATA ALIGNMENT
            // =================================================

            worksheet.eachRow(
                {
                    includeEmpty: false
                },
                (row, rowNumber) => {

                    if (
                        rowNumber === 1
                    ) {

                        return;

                    }


                    row.eachCell(
                        cell => {

                            cell.alignment = {

                                vertical:
                                    "middle",

                                wrapText:
                                    true

                            };

                        }
                    );

                }
            );


            // =================================================
            // AUTO WIDTH
            // =================================================

            worksheet.columns.forEach(
                column => {

                    let maxLength =
                        column.header
                            ? String(
                                column.header
                            ).length
                            : 10;


                    column.eachCell(
                        {
                            includeEmpty:
                                false
                        },
                        cell => {

                            let value =
                                cell.value;


                            if (
                                value === null ||
                                value === undefined
                            ) {

                                value = "";

                            }


                            if (
                                typeof value === "object" &&
                                value !== null
                            ) {

                                if (
                                    value instanceof Date
                                ) {

                                    value =
                                        value.toISOString();

                                } else {

                                    value =
                                        JSON.stringify(
                                            value
                                        );

                                }

                            }


                            maxLength =
                                Math.max(
                                    maxLength,
                                    String(
                                        value
                                    ).length
                                );

                        }
                    );


                    column.width =
                        Math.min(
                            Math.max(
                                maxLength + 2,
                                10
                            ),
                            50
                        );

                }
            );

        }


        // =================================================
        // FREEZE HEADER
        // =================================================

        worksheet.views = [
            {
                state: "frozen",
                ySplit: 1
            }
        ];


        // =================================================
        // AUTO FILTER
        // =================================================

        if (
            data.length > 0 &&
            worksheet.columnCount > 0
        ) {

            worksheet.autoFilter = {

                from: {
                    row: 1,
                    column: 1
                },

                to: {
                    row: 1,
                    column:
                        worksheet.columnCount
                }

            };

        }


        // =================================================
        // RESPONSE HEADERS
        // =================================================

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );


        // =================================================
        // WRITE FILE
        // =================================================

        await workbook.xlsx.write(
            res
        );


        res.end();

    }


    // =====================================================
    // DATE FILTER
    //
    // รองรับ:
    // startDate / endDate
    // dateFrom / dateTo
    // =====================================================

    getDateRange(req) {

        const startDate =
            req.query.startDate ||
            req.query.dateFrom ||
            null;


        const endDate =
            req.query.endDate ||
            req.query.dateTo ||
            null;


        return {

            startDate,

            endDate

        };

    }


    // =====================================================
    // EXPORT EXCEL
    //
    // GET /api/reports/export-excel/:type
    //
    // type:
    // stock
    // movement
    // import
    // export
    // supplier
    // summary
    // =====================================================

    async exportExcel(
        req,
        res
    ) {

        try {

            const type =
                String(
                    req.params.type || ""
                )
                .trim()
                .toLowerCase();


            const {
                startDate,
                endDate
            } =
                this.getDateRange(req);


            let rows = [];

            let filename =
                "";

            let sheetName =
                "";


            // =================================================
            // STOCK
            // =================================================

            if (
                type === "stock"
            ) {

                rows =
                    await ReportService.stockReport();


                filename =
                    "stock-report.xlsx";


                sheetName =
                    "Stock";

            }


            // =================================================
            // MOVEMENT
            // =================================================

            else if (
                type === "movement"
            ) {

                rows =
                    await ReportService.movementReport(
                        startDate,
                        endDate
                    );


                filename =
                    "movement-report.xlsx";


                sheetName =
                    "Movement";

            }


            // =================================================
            // IMPORT
            // =================================================

            else if (
                type === "import"
            ) {

                rows =
                    await ReportService.importReport(
                        startDate,
                        endDate
                    );


                filename =
                    "import-report.xlsx";


                sheetName =
                    "Import";

            }


            // =================================================
            // EXPORT
            // =================================================

            else if (
                type === "export"
            ) {

                rows =
                    await ReportService.exportReport(
                        startDate,
                        endDate
                    );


                filename =
                    "export-report.xlsx";


                sheetName =
                    "Export";

            }


            // =================================================
            // SUPPLIER
            // =================================================

            else if (
                type === "supplier"
            ) {

                rows =
                    await ReportService.supplierReport();


                filename =
                    "supplier-report.xlsx";


                sheetName =
                    "Supplier";

            }


            // =================================================
            // SUMMARY
            // =================================================

            else if (
                type === "summary"
            ) {

                const summary =
                    await ReportService.summaryReport(
                        startDate,
                        endDate
                    );


                rows = [
                    summary
                ];


                filename =
                    "summary-report.xlsx";


                sheetName =
                    "Summary";

            }


            // =================================================
            // INVALID TYPE
            // =================================================

            else {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid Excel report type",

                        allowed: [

                            "stock",

                            "movement",

                            "import",

                            "export",

                            "supplier",

                            "summary"

                        ]

                    });

            }


            return await this.sendExcel(

                res,

                filename,

                sheetName,

                rows

            );

        } catch (err) {

            console.error(
                "Report exportExcel error:",
                err
            );


            return res
                .status(
                    err.status || 500
                )
                .json({

                    success: false,

                    message:
                        err.message ||
                        "Failed to export Excel report"

                });

        }

    }


    // =====================================================
    // STOCK REPORT
    // GET /api/reports/stock
    // =====================================================

    async stockReport(
        req,
        res
    ) {

        try {

            const data =
                await ReportService.stockReport();


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            if (
                req.query.format === "excel"
            ) {

                return await this.sendExcel(

                    res,

                    "stock-report.xlsx",

                    "Stock",

                    rows

                );

            }


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


    // =====================================================
    // MOVEMENT REPORT
    // =====================================================

    async movementReport(
        req,
        res
    ) {

        try {

            const {
                startDate,
                endDate
            } =
                this.getDateRange(req);


            const data =
                await ReportService.movementReport(
                    startDate,
                    endDate
                );


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            if (
                req.query.format === "excel"
            ) {

                return await this.sendExcel(

                    res,

                    "movement-report.xlsx",

                    "Movement",

                    rows

                );

            }


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


    // =====================================================
    // IMPORT REPORT
    // =====================================================

    async importReport(
        req,
        res
    ) {

        try {

            const {
                startDate,
                endDate
            } =
                this.getDateRange(req);


            const data =
                await ReportService.importReport(
                    startDate,
                    endDate
                );


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            if (
                req.query.format === "excel"
            ) {

                return await this.sendExcel(

                    res,

                    "import-report.xlsx",

                    "Import",

                    rows

                );

            }


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


    // =====================================================
    // EXPORT REPORT
    // =====================================================

    async exportReport(
        req,
        res
    ) {

        try {

            const {
                startDate,
                endDate
            } =
                this.getDateRange(req);


            const data =
                await ReportService.exportReport(
                    startDate,
                    endDate
                );


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            if (
                req.query.format === "excel"
            ) {

                return await this.sendExcel(

                    res,

                    "export-report.xlsx",

                    "Export",

                    rows

                );

            }


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


    // =====================================================
    // SUPPLIER REPORT
    // =====================================================

    async supplierReport(
        req,
        res
    ) {

        try {

            const data =
                await ReportService.supplierReport();


            const rows =
                Array.isArray(data)
                    ? data
                    : [];


            if (
                req.query.format === "excel"
            ) {

                return await this.sendExcel(

                    res,

                    "supplier-report.xlsx",

                    "Supplier",

                    rows

                );

            }


            return res.json({

                success: true,

                total:
                    rows.length,

                data:
                    rows

            });

        } catch (err) {

            console.error(
                "Report supplierReport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load supplier report"

            });

        }

    }


    // =====================================================
    // SUMMARY REPORT
    // =====================================================

    async summaryReport(
        req,
        res
    ) {

        try {

            const {
                startDate,
                endDate
            } =
                this.getDateRange(req);


            const data =
                await ReportService.summaryReport(
                    startDate,
                    endDate
                );


            if (
                req.query.format === "excel"
            ) {

                return await this.sendExcel(

                    res,

                    "summary-report.xlsx",

                    "Summary",

                    [
                        data
                    ]

                );

            }


            return res.json({

                success: true,

                data:
                    data || {}

            });

        } catch (err) {

            console.error(
                "Report summaryReport error:",
                err
            );


            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load summary report"

            });

        }

    }


    // =====================================================
    // INVENTORY VALUE
    // =====================================================

    async inventoryValue(
        req,
        res
    ) {

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