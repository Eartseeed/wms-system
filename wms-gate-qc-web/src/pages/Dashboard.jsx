import { useEffect, useState } from 'react'

function Dashboard() {

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const [records, setRecords] =
    useState([])

  const [fromDate, setFromDate] =
    useState(today)

  const [toDate, setToDate] =
    useState(today)

  const loadRecords = async () => {

    try {

      const res =
        await fetch(
          'http://localhost:3001/gate-in'
        )

      const result =
        await res.json()

      let filtered = result

      if (
        fromDate &&
        toDate
      ) {

        filtered =
          result.filter(item => {

            const rowDate =
              new Date(item.time)

            return (
              rowDate >=
                new Date(
                  fromDate + 'T00:00:00'
                )
              &&
              rowDate <=
                new Date(
                  toDate + 'T23:59:59'
                )
            )

          })

      }

      setRecords(filtered)

    } catch (err) {

      console.log(err)

    }

  }

  const exportExcel = () => {

    let url =
      'http://localhost:3001/export-excel'

    if (
      fromDate &&
      toDate
    ) {

      url +=
        `?from=${fromDate}&to=${toDate}`

    }

    window.open(
      url,
      '_blank'
    )

  }

  useEffect(() => {

    loadRecords()

  }, [
    fromDate,
    toDate
  ])

  const truckIn =
    records.filter(
      x => x.status === 'IN'
    ).length

  const truckOut =
    records.filter(
      x => x.status !== 'IN'
    ).length

  const totalTrips =
    records.length

  const totalNetWeight =
    records.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.net_weight || 0
        ),
      0
    )

  const maxValue =
    Math.max(
      truckIn,
      truckOut,
      totalTrips,
      totalNetWeight,
      1
    )

  return (

    <div>

      <h1 className="page-title">
        Dashboard
      </h1>

      <div className="dashboard-grid">

        <Card
          title="ຈຳນວນ ລົດເຂົ້າ"
          value={truckIn}
          icon="🚛"
          color="#2563eb"
          max={maxValue}
        />

        <Card
          title="ຈຳນວນ ລົດອອກ"
          value={truckOut}
          icon="🚛"
          color="#f97316"
          max={maxValue}
        />

        <Card
          title="ຈຳນວນ ສິນຄ້າໃນສາງ"
          value={totalTrips}
          icon="📦"
          color="#16a34a"
          max={maxValue}
        />

        <Card
          title="ຈຳນວນ ນ້ຳໜັກສິນຄ້າໃນສາງ"
          value={`${totalNetWeight} KG`}
          rawValue={totalNetWeight}
          icon="⚖️"
          color="#7c3aed"
          max={maxValue}
        />

      </div>

<div
  className="card"
  style={{
    marginBottom:'25px'
  }}
>

  <h2
    style={{
      marginBottom:'20px'
    }}
  >
    📅 Filter Date
  </h2>

  <div className="filter-row">

    <div className="filter-date">

      <input
        type="date"
        value={fromDate}
        onChange={(e)=>
          setFromDate(
            e.target.value
          )
        }
        onClick={(e)=>
          e.target.showPicker()
        }
      />

    </div>

    <div className="filter-date">

      <input
        type="date"
        value={toDate}
        onChange={(e)=>
          setToDate(
            e.target.value
          )
        }
        onClick={(e)=>
          e.target.showPicker()
        }
      />

    </div>

    <div className="filter-export">

      <button
        onClick={exportExcel}
      >
        📄 Export Excel
      </button>

    </div>

  </div>

</div>

      <div className="table-box">

        <table className="table">

          <thead>

            <tr>
              <th>ລຳດັບ</th>
              <th>ທະບຽນລົດ</th>
              <th>ຊື່ ຄົນຂັບ</th>
              <th>ສິນຄ້າ</th>
              <th>ນ້ຳໜັກ ຂາເຂົ້າ</th>
              <th>ສະຖານະ</th>
              <th>ນ້ຳໜັກ ຂາອອກ</th>
              <th>ນ້ຳໜັກ ສິນຄ້າ</th>
              <th>ເວລາ ລົດເຂົ້າ</th>
              <th>ເວລາ ລົດອອກ</th>
            </tr>

          </thead>

          <tbody>

            {

              records.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={item.id}
                  >

                    <td>{index + 1}</td>
                    <td>{item.plate}</td>
                    <td>{item.driver}</td>
                    <td>{item.product}</td>
                    <td>{item.weight}</td>

                    <td>

                      <span
                        style={{

                          background:
                            item.status === 'IN'
                              ? '#dbeafe'
                              : '#dcfce7',

                          color:
                            item.status === 'IN'
                              ? '#2563eb'
                              : '#16a34a',

                          padding:
                            '5px 10px',

                          borderRadius:
                            '5px'

                        }}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td>{item.weight_out}</td>
                    <td>{item.net_weight}</td>
                    <td>{item.time}</td>
                    <td>{item.out_time}</td>

                  </tr>

                )

              )

            }

          </tbody>

        </table>

      </div>

    </div>

  )

}

function Card({
  title,
  value,
  rawValue,
  icon,
  color,
  max
}) {

  const currentValue =
    rawValue ??
    Number(value)

  const widthPercent =
    Math.max(
      (
        currentValue /
        max
      ) * 100,
      5
    )

  return (

    <div className="dashboard-card">

      <div
        style={{
          display:'flex',
          alignItems:'center',
          gap:'15px',
          marginBottom:'20px'
        }}
      >

        <div
          style={{
            width:'70px',
            height:'70px',
            borderRadius:'18px',
            background:'#f8fafc',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontSize:'38px'
          }}
        >
          {icon}
        </div>

        <div>

          <h3>{title}</h3>

          <div
            style={{
              fontSize:'42px',
              fontWeight:'700',
              color
            }}
          >
            {value}
          </div>

        </div>

      </div>

      <div
        style={{
          width:'100%',
          height:'14px',
          background:'#e2e8f0',
          borderRadius:'999px',
          overflow:'hidden'
        }}
      >

        <div
          style={{
            width:`${widthPercent}%`,
            height:'100%',
            background:color,
            borderRadius:'999px',
            transition:'all .3s ease'
          }}
        />

      </div>

    </div>

  )

}

export default Dashboard