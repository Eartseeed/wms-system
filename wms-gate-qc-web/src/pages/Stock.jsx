import { useEffect, useState } from 'react'

function Stock() {

  const [stocks, setStocks] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const loadStock = async () => {

    try {

      const res = await fetch(
        'http://localhost:3001/stock'
      )

      const data =
        await res.json()

      if (Array.isArray(data)) {

        setStocks(data)

      } else {

        console.log(
          'Stock API Error:',
          data
        )

        setStocks([])

      }

    } catch (err) {

      console.log(err)

      setStocks([])

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    loadStock()

    const timer =
      setInterval(
        loadStock,
        5000
      )

    return () =>
      clearInterval(timer)

  }, [])

  return (

    <div>

      <div style={headerStyle}>

        <div>

          <h1 style={titleStyle}>
            📦 Stock Management
          </h1>

        </div>

        <div style={badgeStyle}>
          {stocks.length} Products
        </div>

      </div>

      <div style={tableBoxStyle}>

        {

          loading ? (

            <div style={emptyStyle}>
              Loading Stock...
            </div>

          ) :

          stocks.length === 0 ? (

            <div style={emptyStyle}>
              No Stock Data
            </div>

          ) :

          (

            <table style={tableStyle}>

              <thead>

                <tr>

                  <th style={thStyle}>
                    ສິນຄ້າ
                  </th>

                  <th style={thStyle}>
                    ນ້ຳໜັກ ສິນຄ້າ (KG)
                  </th>

                </tr>

              </thead>

              <tbody>

                {

                  stocks.map(item => (

                    <tr
                      key={item.product}
                    >

                      <td style={tdStyle}>
                        📦 {item.product}
                      </td>

                      <td style={tdStyle}>

                        <span
                          style={
                            stockBadgeStyle
                          }
                        >

                          {

                            Number(
                              item.stock || 0
                            ).toLocaleString()

                          }

                          {' '}KG

                        </span>

                      </td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          )

        }

      </div>

    </div>

  )

}

const headerStyle = {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems: 'center',
  marginBottom: '25px'
}

const titleStyle = {
  fontSize: '42px',
  margin: 0,
  color: '#1f2937'
}

const subTitleStyle = {
  marginTop: '5px',
  color: '#6b7280'
}

const badgeStyle = {
  background: '#2563eb',
  color: 'white',
  padding: '10px 18px',
  borderRadius: '999px',
  fontWeight: 'bold'
}

const tableBoxStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '25px',
  boxShadow:
    '0 4px 20px rgba(0,0,0,0.08)',
  overflowX: 'auto'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
}

const thStyle = {
  textAlign: 'left',
  padding: '15px',
  borderBottom:
    '2px solid #e5e7eb',
  color: '#374151'
}

const tdStyle = {
  padding: '15px',
  borderBottom:
    '1px solid #f1f5f9',
  color: '#111827'
}

const stockBadgeStyle = {
  background: '#dcfce7',
  color: '#15803d',
  padding: '8px 14px',
  borderRadius: '999px',
  fontWeight: 'bold'
}

const emptyStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#6b7280',
  fontSize: '18px'
}

export default Stock