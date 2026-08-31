const AuthService =
    require(
        "../services/authService"
    );


// =====================================================
// AUTH CONTROLLER
//
// หน้าที่:
//
// รับ Request จาก Frontend
//
//        ↓
//
// เรียก AuthService
//
//        ↓
//
// ส่ง Token + User + Role
// กลับไป Frontend
//
// Flow:
//
// Login.jsx
//
// POST /api/auth/login
//
//        ↓
//
// authController.login
//
//        ↓
//
// AuthService.login
//
//        ↓
//
// Database
//
// users.role_id
//
//        ↓
//
// roles.name
//
//        ↓
//
// JWT Token + User Role
//
//        ↓
//
// Login.jsx
//
//        ↓
//
// App.jsx
// =====================================================


class AuthController {


    // =================================================
    // LOGIN
    //
    // Request:
    //
    // POST /api/auth/login
    //
    // Body:
    //
    // {
    //
    //     username: "admin",
    //
    //     password: "123456"
    //
    // }
    //
    //
    // Response:
    //
    // {
    //
    //     success: true,
    //
    //     message: "Login successful",
    //
    //     token: "JWT_TOKEN",
    //
    //     user: {
    //
    //         id: 1,
    //
    //         username: "admin",
    //
    //         fullname: "System Admin",
    //
    //         role: "ADMIN"
    //
    //     }
    //
    // }
    // =================================================

    async login(
        req,
        res
    ) {

        try {

            // =============================================
            // GET REQUEST BODY
            //
            // รองรับ:
            //
            // req.body = undefined
            //
            // เพื่อไม่ให้ระบบ Error
            // =============================================

            const body =
                req.body ||
                {};


            // =============================================
            // USERNAME
            // =============================================

            const username =
                String(
                    body.username ||
                    ""
                )
                    .trim();


            // =============================================
            // PASSWORD
            //
            // ไม่ trim Password
            //
            // เพราะ Password อาจมี space
            // =============================================

            const password =
                String(
                    body.password ||
                    ""
                );


            // =============================================
            // VALIDATE USERNAME
            // =============================================

            if (
                !username
            ) {

                return res
                    .status(
                        400
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Username is required"

                    });

            }


            // =============================================
            // VALIDATE PASSWORD
            // =============================================

            if (
                !password
            ) {

                return res
                    .status(
                        400
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Password is required"

                    });

            }


            // =============================================
            // LOGIN
            //
            // AuthService จะ:
            //
            // 1. หา User
            // 2. JOIN Role
            // 3. ตรวจ Password
            // 4. ตรวจ Status
            // 5. สร้าง JWT
            //
            // Result:
            //
            // {
            //
            //     token,
            //
            //     user
            //
            // }
            // =============================================

            const result =
                await AuthService.login(

                    username,

                    password

                );


            // =============================================
            // CHECK RESULT
            //
            // ป้องกันกรณี Service
            // ไม่ส่ง Token กลับมา
            // =============================================

            if (
                !result ||
                !result.token
            ) {

                throw new Error(
                    "Login token was not created"
                );

            }


            // =============================================
            // LOGIN SUCCESS
            //
            // สำคัญ:
            //
            // ส่งข้อมูลแบบตรงกับ
            // frontend Login.jsx
            //
            // Login.jsx อ่าน:
            //
            // data.success
            //
            // data.token
            //
            // data.user.role
            //
            // =============================================

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,


                    message:
                        "Login successful",


                    token:
                        result.token,


                    user:
                        result.user


                });


        } catch (
            err
        ) {

            console.error(
                "Login error:",
                err.message
            );


            // =============================================
            // DEFAULT
            //
            // Username / Password
            // ไม่ถูกต้อง
            //
            // Service จะ throw:
            //
            // Invalid username or password
            // =============================================

            const message =
                err.message ||
                "Login failed";


            // =============================================
            // STATUS CODE
            //
            // 401:
            //
            // Login ไม่สำเร็จ
            //
            // 403:
            //
            // Account Disabled
            //
            // 500:
            //
            // Server Error
            // =============================================

            let statusCode =
                401;


            // =============================================
            // DISABLED USER
            // =============================================

            if (
                message
                    .toLowerCase()
                    .includes(
                        "disabled"
                    )
            ) {

                statusCode =
                    403;

            }


            // =============================================
            // INTERNAL ERROR
            //
            // กรณี Database / JWT Error
            // =============================================

            if (
                message
                    .toLowerCase()
                    .includes(
                        "database"
                    )
                ||
                message
                    .toLowerCase()
                    .includes(
                        "jwt"
                    )
                ||
                message
                    .toLowerCase()
                    .includes(
                        "secret"
                    )
            ) {

                statusCode =
                    500;

            }


            return res
                .status(
                    statusCode
                )
                .json({

                    success:
                        false,

                    message

                });

        }

    }


    // =================================================
    // ME
    //
    // ใช้ตรวจสอบ User ปัจจุบัน
    //
    // Request:
    //
    // GET /api/auth/me
    //
    // ต้องผ่าน:
    //
    // authenticate
    //
    // เพราะ middleware จะใส่:
    //
    // req.user
    //
    // Response:
    //
    // {
    //
    //     success: true,
    //
    //     user: {
    //
    //         id,
    //
    //         username,
    //
    //         fullname,
    //
    //         role
    //
    //     }
    //
    // }
    // =================================================

    async me(
        req,
        res
    ) {

        try {

            // =============================================
            // ถ้าไม่มี User
            //
            // แปลว่า Middleware
            // ยังไม่ Authenticate
            // =============================================

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


            // =============================================
            // SUCCESS
            // =============================================

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,


                    user:
                        req.user

                });


        } catch (
            err
        ) {

            console.error(
                "Get current user error:",
                err.message
            );


            return res
                .status(
                    500
                )
                .json({

                    success:
                        false,

                    message:
                        err.message ||
                        "Failed to get current user"

                });

        }

    }


    // =================================================
    // LOGOUT
    //
    // JWT เป็น Stateless
    //
    // Backend ไม่จำเป็นต้องเก็บ Session
    //
    // Frontend จะเป็นคนลบ:
    //
    // token
    // user
    // role
    //
    // แต่มี Endpoint นี้ไว้
    // เพื่อให้ Flow API สมบูรณ์
    //
    // POST /api/auth/logout
    // =================================================

    async logout(
        req,
        res
    ) {

        try {

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,

                    message:
                        "Logout successful"

                });


        } catch (
            err
        ) {

            console.error(
                "Logout error:",
                err.message
            );


            return res
                .status(
                    500
                )
                .json({

                    success:
                        false,

                    message:
                        "Logout failed"

                });

        }

    }


}


// =====================================================
// EXPORT
//
// รูปแบบนี้ให้ routes/auth.js ใช้:
//
// const AuthController =
//     require("../controllers/authController");
//
// router.post(
//     "/login",
//     AuthController.login
// );
// =====================================================

module.exports =
    new AuthController();