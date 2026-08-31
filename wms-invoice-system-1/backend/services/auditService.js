const db = require("../config/database");

/**
 * เขียน Audit Log
 */
function writeAuditLog({
    username = "",
    role = "",
    action = "",
    module = "",
    description = ""
}) {
    return new Promise((resolve, reject) => {
        db.run(
            `
            INSERT INTO audit_logs(
                username,
                role,
                action,
                module,
                description
            )
            VALUES(?,?,?,?,?)
            `,
            [
                username,
                role,
                action,
                module,
                description
            ],
            function (err) {
                if (err) {
                    return reject(err);
                }

                resolve(this.lastID);
            }
        );
    });
}

module.exports = {
    writeAuditLog
};