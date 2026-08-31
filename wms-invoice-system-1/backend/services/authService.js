const bcrypt =
    require(
        "bcryptjs"
    );

const jwt =
    require(
        "jsonwebtoken"
    );

const {
    get,
    run
} =
    require(
        "../config/database"
    );


// =====================================================
// JWT SECRET
//
// ต้องใช้ Secret เดียวกันกับ:
//
// middleware/auth.js
//
// แนะนำให้กำหนดใน .env:
//
// JWT_SECRET=your_secret_key
//
// ถ้าไม่มี .env
// จะใช้ค่า default เดียวกับ middleware/auth.js
// =====================================================

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "cwms-invoice-system-jwt-secret-change-this";


// =====================================================
// JWT EXPIRES
//
// เปลี่ยนค่าได้จาก .env:
//
// JWT_EXPIRES_IN=7d
//
// ค่า default = 7 วัน
// =====================================================

const JWT_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN ||
    "7d";


// =====================================================
// NORMALIZE ROLE
//
// ทำให้ Role มีรูปแบบเดียวกัน
//
// Database อาจเก็บ:
//
// admin
// supervisor
// employee
//
// Frontend ใช้:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// JWT จะส่งตัวพิมพ์ใหญ่ให้ทั้งระบบ
// =====================================================

const normalizeRole =
    (
        role
    ) => {

        const value =
            String(
                role ||
                "EMPLOYEE"
            )
                .trim()
                .toUpperCase();


        // =================================================
        // ADMIN
        // =================================================

        if (
            value ===
            "ADMIN"
        ) {

            return "ADMIN";

        }


        // =================================================
        // SUPERVISOR
        // =================================================

        if (
            value ===
            "SUPERVISOR"
        ) {

            return "SUPERVISOR";

        }


        // =================================================
        // EMPLOYEE
        //
        // ค่า default
        // =================================================

        return "EMPLOYEE";

    };


// =====================================================
// AUTH SERVICE
// =====================================================

class AuthService {


    // =================================================
    // FIND USER BY USERNAME
    //
    // สำคัญ:
    //
    // users.role_id
    //      ↓
    // roles.id
    //
    // ต้อง JOIN ตาราง roles
    // เพื่อให้ Login ได้ Role จริง
    //
    // Response:
    //
    // {
    //
    //     id,
    //
    //     username,
    //
    //     password,
    //
    //     fullname,
    //
    //     role
    //
    // }
    // =================================================

    async findUserByUsername(
        username
    ) {

        const value =
            String(
                username ||
                ""
            )
                .trim();


        if (
            !value
        ) {

            return null;

        }


        return await get(
            `
            SELECT

                u.id,

                u.username,

                u.password,

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

            WHERE
                LOWER(
                    u.username
                )
                =
                LOWER(
                    ?
                )

            LIMIT 1
            `,
            [

                value

            ]
        );

    }


    // =================================================
    // UPDATE LAST LOGIN
    //
    // บันทึกเวลา Login ล่าสุด
    //
    // ถ้าตารางไม่มี last_login
    // ระบบจะไม่ทำให้ Login ล้มเหลว
    // =================================================

    async updateLastLogin(
        userId
    ) {

        try {

            await run(
                `
                UPDATE users

                SET

                    last_login =
                        CURRENT_TIMESTAMP,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE
                    id = ?
                `,
                [

                    userId

                ]
            );


        } catch (
            err
        ) {

            // =============================================
            // ไม่หยุด Login
            //
            // เพราะบางฐานข้อมูลเก่า
            // อาจไม่มี column last_login
            // =============================================

            console.warn(
                "Update last login skipped:",
                err.message
            );

        }

    }


    // =================================================
    // CREATE TOKEN
    //
    // ใส่ Role ลง JWT โดยตรง
    //
    // สำคัญมาก:
    //
    // middleware/auth.js จะอ่าน:
    //
    // decoded.role
    //
    // ถ้าไม่ใส่ Role ตรงนี้
    // ระบบจะกลายเป็น EMPLOYEE
    // =================================================

    createToken(
        user
    ) {

        const role =
            normalizeRole(
                user?.role
            );


        return jwt.sign(
            {

                // =========================================
                // USER ID
                // =========================================

                id:
                    user.id,


                // =========================================
                // USERNAME
                // =========================================

                username:
                    user.username,


                // =========================================
                // FULL NAME
                // =========================================

                fullname:
                    user.fullname ||
                    "",


                // =========================================
                // ROLE
                //
                // ADMIN
                // SUPERVISOR
                // EMPLOYEE
                // =========================================

                role

            },

            JWT_SECRET,

            {

                expiresIn:
                    JWT_EXPIRES_IN

            }
        );

    }


    // =================================================
    // BUILD USER RESPONSE
    //
    // ไม่ส่ง password กลับไป Frontend
    // =================================================

    buildUserResponse(
        user
    ) {

        return {

            // =============================================
            // ID
            // =============================================

            id:
                user.id,


            // =============================================
            // USERNAME
            // =============================================

            username:
                user.username,


            // =============================================
            // FULL NAME
            // =============================================

            fullname:
                user.fullname ||
                "",


            // =============================================
            // ROLE
            //
            // ส่งเป็นตัวพิมพ์ใหญ่
            // ให้ตรงกับ Frontend
            // =============================================

            role:
                normalizeRole(
                    user.role
                )

        };

    }


    // =================================================
    // LOGIN
    //
    // Flow:
    //
    // Username + Password
    //        ↓
    //
    // Find User + Role
    //        ↓
    //
    // Check Status
    //        ↓
    //
    // Check Password
    //        ↓
    //
    // Update Last Login
    //        ↓
    //
    // Create JWT
    //        ↓
    //
    // Return:
    //
    // token
    //
    // user {
    //   id,
    //   username,
    //   fullname,
    //   role
    // }
    // =================================================

    async login(
        username,
        password
    ) {

        // ===============================================
        // NORMALIZE INPUT
        // ===============================================

        const usernameValue =
            String(
                username ||
                ""
            )
                .trim();


        const passwordValue =
            String(
                password ||
                ""
            );


        // ===============================================
        // VALIDATE USERNAME
        // ===============================================

        if (
            !usernameValue
        ) {

            throw new Error(
                "Username is required"
            );

        }


        // ===============================================
        // VALIDATE PASSWORD
        // ===============================================

        if (
            !passwordValue
        ) {

            throw new Error(
                "Password is required"
            );

        }


        // ===============================================
        // FIND USER
        //
        // Query นี้ JOIN roles แล้ว
        // ===============================================

        const user =
            await this.findUserByUsername(
                usernameValue
            );


        // ===============================================
        // USER NOT FOUND
        // ===============================================

        if (
            !user
        ) {

            throw new Error(
                "Invalid username or password"
            );

        }


        // ===============================================
        // CHECK USER STATUS
        //
        // status:
        //
        // 1 = Active
        // 0 = Disabled
        //
        // ถ้า status เป็น null
        // จะอนุญาตเพื่อรองรับฐานข้อมูลเก่า
        // ===============================================

        if (
            user.status !==
            undefined
            &&
            user.status !==
            null
            &&
            Number(
                user.status
            ) === 0
        ) {

            throw new Error(
                "This user account is disabled"
            );

        }


        // ===============================================
        // CHECK PASSWORD
        //
        // รองรับทั้ง:
        //
        // bcrypt password
        //
        // และ password plain text ของข้อมูลเก่า
        //
        // ถ้าเป็น plain text และ Login ผ่าน
        // ระบบจะ Hash ใหม่ให้
        // ===============================================

        let passwordMatched =
            false;


        const storedPassword =
            String(
                user.password ||
                ""
            );


        // ===============================================
        // BCRYPT HASH
        //
        // bcrypt hash ปกติขึ้นต้นด้วย:
        //
        // $2a$
        // $2b$
        // $2y$
        // ===============================================

        const isBcryptHash =
            storedPassword.startsWith(
                "$2a$"
            )
            ||
            storedPassword.startsWith(
                "$2b$"
            )
            ||
            storedPassword.startsWith(
                "$2y$"
            );


        if (
            isBcryptHash
        ) {

            passwordMatched =
                await bcrypt.compare(
                    passwordValue,
                    storedPassword
                );


        } else {

            // =============================================
            // LEGACY PLAIN TEXT PASSWORD
            //
            // ใช้รองรับ User เก่า
            // =============================================

            passwordMatched =
                passwordValue ===
                storedPassword;


            // =============================================
            // LOGIN ผ่านแล้ว
            // Hash password ใหม่ทันที
            // =============================================

            if (
                passwordMatched
            ) {

                const passwordHash =
                    await bcrypt.hash(
                        passwordValue,
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

                        user.id

                    ]
                );

            }

        }


        // ===============================================
        // PASSWORD NOT MATCHED
        // ===============================================

        if (
            !passwordMatched
        ) {

            throw new Error(
                "Invalid username or password"
            );

        }


        // ===============================================
        // UPDATE LAST LOGIN
        // ===============================================

        await this.updateLastLogin(
            user.id
        );


        // ===============================================
        // CREATE TOKEN
        //
        // JWT มี Role ล่าสุด
        // ===============================================

        const token =
            this.createToken(
                user
            );


        // ===============================================
        // BUILD USER
        //
        // ส่ง Role ล่าสุดกลับ Frontend
        // ===============================================

        const userData =
            this.buildUserResponse(
                user
            );


        // ===============================================
        // RETURN
        //
        // Controller สามารถใช้:
        //
        // const result =
        //     await AuthService.login(
        //         username,
        //         password
        //     );
        //
        // result.token
        //
        // result.user
        // ===============================================

        return {

            token,

            user:
                userData

        };

    }


}


// =====================================================
// EXPORT SINGLE INSTANCE
//
// รูปแบบนี้ทำให้ Controller ใช้:
//
// const AuthService =
//     require("../services/authService");
//
// await AuthService.login(...)
// =====================================================

module.exports =
    new AuthService();