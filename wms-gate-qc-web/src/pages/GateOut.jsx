import { useState } from 'react'

function GateOut() {

  const [keyword, setKeyword] =
    useState('')

  const [record, setRecord] =
    useState(null)

  const [weightOut, setWeightOut] =
    useState('')

  const searchPlate = async () => {

    try {

      const res = await fetch(
        `http://localhost:3001/search?keyword=${keyword}`
      )

      const data =
        await res.json()

      const truck = data.find(
        item => item.status === 'IN'
      )

      if (!truck) {

        alert(
          'ไม่พบรถที่อยู่ในโรงงาน'
        )

        setRecord(null)

        return

      }

      setRecord(truck)

    } catch (err) {

      console.log(err)

    }

  }

  const gateOut = async () => {

    if (!record) return

    if (!weightOut) {

      alert('กรอก Weight Out')

      return

    }

    if (

      Number(weightOut)

      >

      Number(record.weight)

    ) {

      alert(
        'Weight Out มากกว่า Weight In ไม่ได้'
      )

      return

    }

    const netWeight =

      Math.max(

        Number(record.weight)

        -

        Number(weightOut),

        0

      )

    try {

      await fetch(

        `http://localhost:3001/gate-out/${record.id}`,

        {

          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({

            weight_out: weightOut,

            net_weight: netWeight

          })

        }

      )

      alert('Gate Out Success')

      setRecord(null)
      setKeyword('')
      setWeightOut('')

    } catch (err) {

      console.log(err)

    }

  }

  return (

    <div>

<h1
  className="page-title"
  style={{
    textAlign: 'center',
    marginBottom: '25px'
  }}
>
  🚛 Gate Out
</h1>

      <div className="card">

        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}
        >

          <input
            type="text"
            placeholder="ຄົ້ນຫາທະບຽນລົດ"
            value={keyword}
            onChange={(e) =>
              setKeyword(
                e.target.value
              )
            }
            onKeyDown={(e) => {

              if (
                e.key === 'Enter'
              ) {

                searchPlate()

              }

            }}
            className="input"
          />

          <button
            onClick={searchPlate}
            className="btn-primary"
            style={{
              width: '200px'
            }}
          >
            Search
          </button>

        </div>

      </div>

      {

        record && (

          <div
            className="card"
            style={{
              marginTop: '20px'
            }}
          >

            <div
              style={{
                marginBottom: '10px'
              }}
            >
              🚚 ທະບຽນລົດ :
              {' '}
              {record.plate}
            </div>

            <div
              style={{
                marginBottom: '10px'
              }}
            >
              👨 ຄົນຂັບລົດ :
              {' '}
              {record.driver}
            </div>

            <div
              style={{
                marginBottom: '10px'
              }}
            >
              📦 ສິນຄ້າ :
              {' '}
              {record.product}
            </div>

            <div
              style={{
                marginBottom: '10px'
              }}
            >
              ⚖️ ນ້ຳໜັກ ຂາເຂົ້າ :
              {' '}
              {record.weight}
              {' '}
              KG
            </div>

            <input
              type="number"
              placeholder="ນ້ຳໜັກ ຂາອອກ"
              value={weightOut}
              onChange={(e) =>
                setWeightOut(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === 'Enter'
                ) {

                  gateOut()

                }

              }}
              className="input"
            />

            <div className="net-weight">

              ນ້ຳໜັກ ສິນຄ້າ :

              {' '}

              {

                Math.max(

                  Number(
                    record.weight
                  )

                  -

                  Number(
                    weightOut || 0
                  ),

                  0

                )

              }

              {' '}
              KG

            </div>

            <button
              onClick={gateOut}
              className="btn-danger"
            >
              ບັນທືກ
            </button>

          </div>

        )

      }

    </div>

  )

}

export default GateOut