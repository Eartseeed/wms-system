import { useEffect, useState } from "react";

function StockManagement() {

  const [stock, setStock] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const loadStock =
    async () => {

      try {

        const res =
          await fetch(
            "http://localhost:3002/stocks"
          );

        const data =
          await res.json();

        setStock(data || []);

      } catch (err) {

        console.log(err);

      }

    };

  useEffect(() => {

    loadStock();

  }, []);

  const filtered =
    stock.filter(item =>

      (item.product_name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );

  return (

    <div>

      <div className="dashboard-header">

        <h1>
          📦 Stock Management
        </h1>

        <button
          onClick={loadStock}
        >
          🔄 Refresh
        </button>

      </div>

      <div className="card">

        <input
          className="search-box"
          placeholder="Search Product..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      <div className="card">

        <table>

          <thead>

            <tr>

              <th>Product</th>

              <th>Import Qty</th>

              <th>Export Qty</th>

              <th>Balance Qty</th>

              <th>Balance Weight</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign: "center"
                  }}
                >
                  No Data
                </td>

              </tr>

            ) : (

              filtered.map((item, index) => (

                <tr key={index}>

                  <td>
                    {item.product_name}
                  </td>

                  <td>
                    {item.import_qty}
                  </td>

                  <td>
                    {item.export_qty}
                  </td>

                  <td>
                    {item.qty}
                  </td>

                  <td>
                    {item.weight}
                  </td>

                  <td>

                    {Number(item.qty) > 0
                      ? "✅ Available"
                      : "❌ Empty"}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default StockManagement;