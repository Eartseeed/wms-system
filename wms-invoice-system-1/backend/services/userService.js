const bcrypt =
    require(
        "bcryptjs"
    );

const {
    all,
    get,
    run
} =
    require(
        "../config/database"
    );


class UserService {


    getAllowedRoles() {

        return [

            "admin",

            "supervisor",

            "employee"

        ];

    }


    async ensureDefaultRoles() {

        const roles =
            [

                {
                    name:
                        "admin",

                    description:
                        "System Administrator"
                },

                {
                    name:
                        "supervisor",

                    description:
                        "Supervisor"
                },

                {
                    name:
                        "employee",

                    description:
                        "Employee"
                }

            ];


        for (
            const role of roles
        ) {

            await run(
                `
                INSERT OR IGNORE
                INTO roles (
                    name,
                    description,
                    status
                )

                VALUES (
                    ?,
                    ?,
                    1
                )
                `,
                [

                    role.name,

                    role.description

                ]
            );

        }

    }


    normalizeRole(
        role
    ) {

        const value =
            String(
                role ||
                "employee"
            )
                .trim()
                .toLowerCase();


        if (
            !this
                .getAllowedRoles()
                .includes(
                    value
                )
        ) {

            throw new Error(
                "Invalid role"
            );

        }


        return value;

    }


    async getRole(
        role
    ) {

        await this.ensureDefaultRoles();


        const roleName =
            this.normalizeRole(
                role
            );


        const roleRow =
            await get(
                `
                SELECT
                    id,
                    name

                FROM roles

                WHERE
                    LOWER(name) = ?

                AND status = 1

                LIMIT 1
                `,
                [

                    roleName

                ]
            );


        if (
            !roleRow
        ) {

            throw new Error(
                "Role not found"
            );

        }


        return roleRow;

    }


    getSelectSql() {

        return `
            SELECT

                u.id,

                u.username,

                u.fullname,

                u.role_id,

                COALESCE(
                    r.name,
                    'employee'
                ) AS role,

                u.status,

                u.created_at,

                u.updated_at

            FROM users u

            LEFT JOIN roles r

                ON r.id =
                    u.role_id
        `;

    }


    async getAll() {

        await this.ensureDefaultRoles();


        return await all(
            `
            ${this.getSelectSql()}

            ORDER BY
                u.id DESC
            `
        );

    }


    async getById(
        id
    ) {

        return await get(
            `
            ${this.getSelectSql()}

            WHERE
                u.id = ?

            LIMIT 1
            `,
            [

                Number(
                    id
                )

            ]
        );

    }


    async create(
        data = {}
    ) {

        const username =
            String(
                data.username ||
                ""
            )
                .trim();


        const password =
            String(
                data.password ||
                ""
            );


        const fullname =
            String(
                data.fullname ||
                data.full_name ||
                ""
            )
                .trim();


        if (
            !username
        ) {

            throw new Error(
                "Username is required"
            );

        }


        if (
            !password
        ) {

            throw new Error(
                "Password is required"
            );

        }


        if (
            !fullname
        ) {

            throw new Error(
                "Full Name is required"
            );

        }


        const duplicate =
            await get(
                `
                SELECT
                    id

                FROM users

                WHERE
                    LOWER(username) =
                    LOWER(?)

                LIMIT 1
                `,
                [

                    username

                ]
            );


        if (
            duplicate
        ) {

            throw new Error(
                "Username already exists"
            );

        }


        const role =
            await this.getRole(
                data.role
            );


        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );


        const result =
            await run(
                `
                INSERT INTO users (

                    username,

                    password,

                    fullname,

                    role_id,

                    status

                )

                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    1
                )
                `,
                [

                    username,

                    passwordHash,

                    fullname,

                    role.id

                ]
            );


        return await this.getById(
            result.id
        );

    }


    async update(
        id,
        data = {}
    ) {

        const userId =
            Number(
                id
            );


        if (
            !Number.isInteger(
                userId
            ) ||
            userId <= 0
        ) {

            throw new Error(
                "Invalid User ID"
            );

        }


        const old =
            await this.getById(
                userId
            );


        if (
            !old
        ) {

            throw new Error(
                "User not found"
            );

        }


        const fullname =
            String(
                data.fullname ||
                data.full_name ||
                old.fullname ||
                ""
            )
                .trim();


        if (
            !fullname
        ) {

            throw new Error(
                "Full Name is required"
            );

        }


        const role =
            await this.getRole(
                data.role ||
                old.role
            );


        await run(
            `
            UPDATE users

            SET

                fullname = ?,

                role_id = ?,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                id = ?
            `,
            [

                fullname,

                role.id,

                userId

            ]
        );


        if (
            data.password &&
            String(
                data.password
            ).trim()
        ) {

            const passwordHash =
                await bcrypt.hash(
                    String(
                        data.password
                    ),
                    10
                );


            await run(
                `
                UPDATE users

                SET

                    password = ?,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE
                    id = ?
                `,
                [

                    passwordHash,

                    userId

                ]
            );

        }


        return await this.getById(
            userId
        );

    }


    async resetPassword(
        id,
        password
    ) {

        const userId =
            Number(
                id
            );


        const newPassword =
            String(
                password ||
                ""
            );


        if (
            !Number.isInteger(
                userId
            ) ||
            userId <= 0
        ) {

            throw new Error(
                "Invalid User ID"
            );

        }


        if (
            !newPassword
        ) {

            throw new Error(
                "Password is required"
            );

        }


        const old =
            await this.getById(
                userId
            );


        if (
            !old
        ) {

            throw new Error(
                "User not found"
            );

        }


        const passwordHash =
            await bcrypt.hash(
                newPassword,
                10
            );


        await run(
            `
            UPDATE users

            SET

                password = ?,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE
                id = ?
            `,
            [

                passwordHash,

                userId

            ]
        );


        return await this.getById(
            userId
        );

    }


    async delete(
        id
    ) {

        const userId =
            Number(
                id
            );


        if (
            !Number.isInteger(
                userId
            ) ||
            userId <= 0
        ) {

            throw new Error(
                "Invalid User ID"
            );

        }


        const old =
            await this.getById(
                userId
            );


        if (
            !old
        ) {

            throw new Error(
                "User not found"
            );

        }


        if (
            String(
                old.username ||
                ""
            )
                .toLowerCase() ===
            "admin"
        ) {

            throw new Error(
                "Cannot delete default admin"
            );

        }


        await run(
            `
            DELETE FROM users

            WHERE
                id = ?
            `,
            [

                userId

            ]
        );


        return true;

    }

}


module.exports =
    new UserService();