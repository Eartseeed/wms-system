// =====================================================
// CWMS API CONFIG
// =====================================================

const SERVER_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3002";


// =====================================================
// API ROOT
// =====================================================

const API =
    `${SERVER_URL}/api`;


// =====================================================
// REQUEST
// =====================================================

async function request(
    path,
    options = {}
) {

    const response =
        await fetch(
            `${API}${path}`,
            {
                ...options
            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        throw new Error(

            data?.message ||

            `API Error: ${response.status}`

        );

    }


    return data;

}


// =====================================================
// GET
// =====================================================

async function apiGet(
    path
) {

    return request(
        path
    );

}


// =====================================================
// POST JSON
// =====================================================

async function apiPost(
    path,
    body
) {

    return request(
        path,
        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify(body)

        }
    );

}


// =====================================================
// PUT JSON
// =====================================================

async function apiPut(
    path,
    body
) {

    return request(
        path,
        {

            method: "PUT",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify(body)

        }
    );

}


// =====================================================
// DELETE
// =====================================================

async function apiDelete(
    path
) {

    return request(
        path,
        {

            method: "DELETE"

        }
    );

}


// =====================================================
// FORM DATA
// =====================================================

async function apiFormData(
    path,
    formData,
    method = "POST"
) {

    return request(
        path,
        {

            method,

            body:
                formData

        }
    );

}


// =====================================================
// EXPORT
// =====================================================

export {

    SERVER_URL,

    API,

    request,

    apiGet,

    apiPost,

    apiPut,

    apiDelete,

    apiFormData

};