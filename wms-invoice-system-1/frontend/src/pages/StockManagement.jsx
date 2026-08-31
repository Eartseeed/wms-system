import {
  useEffect,
  useMemo,
  useState,
  useCallback
} from "react";

import axios from "axios";

import { API } from "../config/api";


function StockManagement() {

  const token =
    localStorage.getItem("token");


  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);


  const pageSize = 10;


  // =========================================================
  // LOAD STOCK
  // =========================================================

  const loadProducts =
    useCallback(async () => {

      try {

        const res =
          await axios.get(
            `${API}/stock`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        setProducts(
          res.data?.data || []
        );


      } catch (err) {

        console.error(
          "Load Stock Error:",
          err
        );


        alert(
          err.response?.data?.message ||
          "Load Stock Failed"
        );

      }

    }, [token]);


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadProducts();

  }, [loadProducts]);


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProducts =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {

        return products;

      }


      return products.filter(
        (p) => {

          return (

            (p.product_code || "")
              .toLowerCase()
              .includes(keyword)

            ||

            (p.product_name || "")
              .toLowerCase()
              .includes(keyword)

          );

        }
      );

    }, [products, search]);


  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProducts.length /
        pageSize
      )
    );


  const currentPage =
    Math.min(
      page,
      totalPages
    );


  const displayProducts =
    filteredProducts.slice(

      (currentPage - 1) *
        pageSize,

      currentPage *
        pageSize

    );


  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  const number =
    (value, decimal = 2) => {

      const n =
        Number(value || 0);

      return n.toLocaleString(
        undefined,
        {
          minimumFractionDigits:
            decimal,

          maximumFractionDigits:
            decimal
        }
      );

    };


  return (

    <div
      style={{
        padding: 20
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <h2>
        📦 Stock Management
      </h2>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap"
        }}
      >

        <input

          placeholder="ຄົ້ນຫາ ລະຫັດສິນຄ້າ / ຊື່ສິນຄ້າ..."

          value={search}

          onChange={(e) => {

            setSearch(
              e.target.value
            );

            setPage(1);

          }}

          style={{
            width: 350,
            padding: 10
          }}

        />


        <button
          onClick={loadProducts}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =====================================================
          STOCK TABLE
      ===================================================== */}

      <div
        style={{
          overflowX: "auto"
        }}
      >

        <table
          border="1"
          cellPadding="10"
          width="100%"
        >

          <thead>

            <tr>

              <th>
                ລະຫັດສິນຄ້າ
              </th>

              <th>
                ຊື່ສິນຄ້າ
              </th>

              <th>
                ຈຳນວນສິນຄ້າ
              </th>

              <th>
                ນ້ຳໜັກ / ໜ່ວຍ
              </th>

              <th>
                ນ້ຳໜັກລວມ
              </th>

              <th>
                ລາຄາລວມ
              </th>

            </tr>

          </thead>


          <tbody>

            {

              displayProducts.length === 0

                ?

                (

                  <tr>

                    <td
                      colSpan="6"
                      align="center"
                    >

                      ບໍ່ພົບຂໍ້ມູນ Stock

                    </td>

                  </tr>

                )

                :

                displayProducts.map(
                  (p) => (

                    <tr
                      key={p.id}
                    >

                      {/* Product Code */}

                      <td>

                        {p.product_code || "-"}

                      </td>


                      {/* Product Name */}

                      <td>

                        {p.product_name || "-"}

                      </td>


                      {/* จำนวนสินค้า */}
<td>
  {number(
    p.qty ?? p.available_qty ?? 0,
    0
  )}
</td>

{/* น้ำหนักต่อหน่วย */}
<td>
  {number(
    p.unit_weight ??
    p.product_default_weight ??
    0
  )}
</td>

{/* น้ำหนักรวม */}
<td>
  {number(
    p.total_weight ?? 0
  )}
</td>

{/* ราคาลวม */}
<td>
  {number(
    p.total_cost ?? 0
  )}
</td>

                    </tr>

                  )
                )

            }

          </tbody>

        </table>

      </div>


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          marginTop: 20
        }}
      >

        <button

          disabled={
            currentPage <= 1
          }

          onClick={() =>
            setPage(
              currentPage - 1
            )
          }

        >

          ◀ ກ່ອນໜ້າ

        </button>


        <span>

          Page {currentPage}
          {" / "}
          {totalPages}

        </span>


        <button

          disabled={
            currentPage >=
            totalPages
          }

          onClick={() =>
            setPage(
              currentPage + 1
            )
          }

        >

          ຖັດໄປ ▶

        </button>

      </div>

    </div>

  );

}


export default StockManagement;