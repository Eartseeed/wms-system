const jwt =
    require(
        "jsonwebtoken"
    );


// =====================================================
// JWT SECRET
//
// ใช้ Secret เดียวกันกับตอนสร้าง Token
//
// แนะนำให้กำหนดใน .env:
//
// JWT_SECRET=your_secret_key
//
// ถ้าไม่มี .env ระบบจะใช้ค่า default ด้านล่าง
// =====================================================

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "cwms-invoice-system-jwt-secret-change-this";


// =====================================================
// NORMALIZE ROLE
//
// หน้าที่:
// ทำให้ชื่อ Role มีรูปแบบเดียวกันทั้งระบบ
//
// ตัวอย่าง:
//
// admin
// ADMIN
// Admin
//
// จะถูกแปลงเป็น:
//
// ADMIN
//
// ถ้าไม่ใช่ ADMIN หรือ SUPERVISOR
// ระบบจะถือเป็น EMPLOYEE
// =====================================================

const normalizeRole =
    (role) => {

        const value =
            String(
                role ||
                "EMPLOYEE"
            )
                .trim()
                .toUpperCase();


        // ---------------------------------------------
        // ADMIN
        // ---------------------------------------------

        if (
            value === "ADMIN"
        ) {

            return "ADMIN";

        }


        // ---------------------------------------------
        // SUPERVISOR
        // ---------------------------------------------

        if (
            value === "SUPERVISOR"
        ) {

            return "SUPERVISOR";

        }


        // ---------------------------------------------
        // EMPLOYEE
        //
        // รองรับชื่อ Role โดยตรง
        // ---------------------------------------------

        if (
            value === "EMPLOYEE"
        ) {

            return "EMPLOYEE";

        }


        // ---------------------------------------------
        // DEFAULT
        //
        // ถ้า Role ว่าง หรือค่าผิด
        // ให้เป็น EMPLOYEE
        // ---------------------------------------------

        return "EMPLOYEE";

    };


// =====================================================
// AUTHENTICATE
//
// หน้าที่:
// 1. ตรวจ Authorization Header
// 2. ตรวจ Bearer Token
// 3. ตรวจ JWT
// 4. อ่านข้อมูล User จาก Token
// 5. ใส่ข้อมูล User ลง req.user
//
// Route ที่ใช้:
//
// router.get(
//     "/example",
//     authenticate,
//     controller
// );
//
// หลังผ่าน authenticate:
//
// req.user = {
//
//     id: 1,
//
//     userId: 1,
//
//     username: "admin",
//
//     fullname: "System Admin",
//
//     role: "ADMIN"
//
// }
// =====================================================

const authenticate =
    (
        req,
        res,
        next
    ) => {

        try {

            // ---------------------------------------------
            // อ่าน Authorization Header
            //
            // รูปแบบที่ต้องการ:
            //
            // Authorization: Bearer TOKEN
            // ---------------------------------------------

            const authorization =
                String(
                    req.headers.authorization ||
                    ""
                )
                    .trim();


            // ---------------------------------------------
            // ถ้าไม่มี Header
            // ให้ถือว่ายังไม่ได้ Login
            // ---------------------------------------------

            if (
                !authorization
            ) {

                return res
                    .status(
                        401
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Unauthorized"

                    });

            }


            // ---------------------------------------------
            // แยก:
            //
            // Bearer TOKEN
            //
            // เป็น:
            //
            // scheme = Bearer
            // token  = TOKEN
            //
            // ใช้ Regex เพื่อรองรับช่องว่างมากกว่า 1 ช่อง
            // ---------------------------------------------

            const [
                scheme,
                token
            ] =
                authorization.split(
                    /\s+/
                );


            // ---------------------------------------------
            // ตรวจว่าต้องเป็น Bearer Token เท่านั้น
            // ---------------------------------------------

            if (
                String(
                    scheme ||
                    ""
                )
                    .toLowerCase() !==
                "bearer"
                ||
                !token
            ) {

                return res
                    .status(
                        401
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Invalid authorization token"

                    });

            }


            // ---------------------------------------------
            // ตรวจสอบ JWT Token
            //
            // ถ้า Token ปลอม / หมดอายุ
            // jwt.verify จะ throw error
            // ---------------------------------------------

            const decoded =
                jwt.verify(
                    token,
                    JWT_SECRET
                );


            // ---------------------------------------------
            // USER ID
            //
            // รองรับ Token หลายรูปแบบ:
            //
            // {
            //     id: 1
            // }
            //
            // หรือ:
            //
            // {
            //     userId: 1
            // }
            //
            // เพื่อให้รองรับ Token ที่สร้างจาก
            // authService เวอร์ชันเดิมและเวอร์ชันใหม่
            // ---------------------------------------------

            const userId =
                decoded.id ||
                decoded.userId;


            // ---------------------------------------------
            // ถ้า Token ไม่มี User ID
            // ให้ถือว่า Token ไม่ถูกต้อง
            // ---------------------------------------------

            if (
                !userId
            ) {

                return res
                    .status(
                        401
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Invalid token"

                    });

            }


            // ---------------------------------------------
            // FULL NAME
            //
            // รองรับ:
            //
            // fullname
            // full_name
            // name
            //
            // เพื่อให้รองรับข้อมูล User
            // จาก Service หลายเวอร์ชัน
            // ---------------------------------------------

            const fullname =
                decoded.fullname ||
                decoded.full_name ||
                decoded.name ||
                "";


            // ---------------------------------------------
            // ROLE
            //
            // รองรับ:
            //
            // role
            // role_name
            // roleName
            //
            // แล้ว Normalize เป็น:
            //
            // ADMIN
            // SUPERVISOR
            // EMPLOYEE
            // ---------------------------------------------

            const role =
                normalizeRole(
                    decoded.role ||
                    decoded.role_name ||
                    decoded.roleName
                );


            // ---------------------------------------------
            // นำข้อมูลจาก JWT
            // ไปเก็บใน req.user
            //
            // Controller และ authorize
            // จะใช้ req.user ต่อไป
            //
            // เก็บทั้ง id และ userId
            // เพื่อให้ Controller เดิมไม่พัง
            // ---------------------------------------------

            req.user =
                {

                    // -------------------------------------
                    // User ID
                    // -------------------------------------

                    id:
                        userId,

                    userId:
                        userId,


                    // -------------------------------------
                    // Username
                    // -------------------------------------

                    username:
                        decoded.username ||
                        "",


                    // -------------------------------------
                    // Full Name
                    // -------------------------------------

                    fullname:
                        fullname,

                    full_name:
                        fullname,


                    // -------------------------------------
                    // Role
                    // -------------------------------------

                    role:
                        role

                };


            // ---------------------------------------------
            // ผ่านการตรวจสอบ
            // ไป Middleware / Controller ถัดไป
            // ---------------------------------------------

            return next();


        } catch (
            err
        ) {

            console.error(
                "Authentication error:",
                err.message
            );


            // ---------------------------------------------
            // ตรวจว่า Token หมดอายุหรือไม่
            // ---------------------------------------------

            const expired =
                err.name ===
                "TokenExpiredError";


            // ---------------------------------------------
            // JWT ผิดรูปแบบ / ปลอม / หมดอายุ
            // ---------------------------------------------

            return res
                .status(
                    401
                )
                .json({

                    success:
                        false,

                    message:
                        expired
                            ? "Token expired"
                            : "Unauthorized"

                });

        }

    };


// =====================================================
// AUTHORIZE
//
// หน้าที่:
// ตรวจ Role ของ User ว่ามีสิทธิ์เข้า Route หรือไม่
//
// ตัวอย่าง:
//
// ADMIN เท่านั้น:
//
// authorize(
//     "ADMIN"
// )
//
// ADMIN และ SUPERVISOR:
//
// authorize(
//     "ADMIN",
//     "SUPERVISOR"
// )
//
// ทุก Role:
//
// authorize(
//     "ADMIN",
//     "SUPERVISOR",
//     "EMPLOYEE"
// )
//
// ต้องใช้หลัง authenticate เสมอ:
//
// router.get(
//     "/users",
//     authenticate,
//     authorize("ADMIN"),
//     UserController.getAll
// );
// =====================================================

const authorize =
    (
        ...allowedRoles
    ) => {

        // ---------------------------------------------
        // Normalize Role ที่อนุญาต
        //
        // เช่น:
        //
        // authorize("admin")
        //
        // จะกลายเป็น:
        //
        // ["ADMIN"]
        // ---------------------------------------------

        const roles =
            allowedRoles.map(
                (
                    role
                ) =>
                    normalizeRole(
                        role
                    )
            );


        // ---------------------------------------------
        // Middleware จริง
        // ---------------------------------------------

        return (
            req,
            res,
            next
        ) => {

            // ---------------------------------------------
            // ถ้าไม่มี User
            //
            // ต้องตรวจสอบก่อนอ่าน req.user.role
            //
            // ปกติจะไม่เกิดขึ้นถ้าใช้
            // authenticate ก่อน authorize
            // ---------------------------------------------

            if (
                !req.user
            ) {

                return res
                    .status(
                        401
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Unauthorized"

                    });

            }


            // ---------------------------------------------
            // อ่าน Role ของ User
            //
            // req.user ถูกสร้างจาก authenticate
            // ---------------------------------------------

            const userRole =
                normalizeRole(
                    req.user.role
                );


            // ---------------------------------------------
            // ตรวจว่า Route นี้มี Role ที่อนุญาตหรือไม่
            //
            // ถ้าไม่ได้ส่ง allowedRoles มา
            // จะถือว่าไม่อนุญาต
            // ---------------------------------------------

            if (
                roles.length === 0
            ) {

                return res
                    .status(
                        403
                    )
                    .json({

                        success:
                            false,

                        message:
                            "No role permission configured"

                    });

            }


            // ---------------------------------------------
            // ตรวจว่า Role อยู่ในรายการที่อนุญาตหรือไม่
            // ---------------------------------------------

            if (
                !roles.includes(
                    userRole
                )
            ) {

                return res
                    .status(
                        403
                    )
                    .json({

                        success:
                            false,

                        message:
                            "You do not have permission to access this resource"

                    });

            }


            // ---------------------------------------------
            // มีสิทธิ์
            // ไปยัง Controller ต่อ
            // ---------------------------------------------

            return next();

        };

    };


// =====================================================
// EXPORT
//
// ไฟล์อื่นจะ import:
//
// const {
//     authenticate,
//     authorize,
//     normalizeRole
// } = require("../middleware/auth");
// =====================================================

module.exports =
    {

        authenticate,

        authorize,

        normalizeRole

    };