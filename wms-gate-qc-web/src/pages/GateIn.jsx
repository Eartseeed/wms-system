import { useState, useRef, useEffect } from 'react'

function GateIn() {

  const [plate, setPlate] = useState('')
  const [driver, setDriver] = useState('')
  const [weight, setWeight] = useState('')
  const [product, setProduct] = useState('')

  const [message, setMessage] =
    useState('')

  const plateRef =
    useRef(null)

  const driverRef =
    useRef(null)

  const weightRef =
    useRef(null)

  const productRef =
    useRef(null)

  useEffect(() => {

    plateRef.current?.focus()

  }, [])

  const saveData = async () => {

    if (
      !plate ||
      !driver ||
      !weight ||
      !product
    ) {

      alert(
        'Please fill all fields'
      )

      return

    }

    try {

      const savePlate = plate

      const res = await fetch(
        'http://localhost:3001/gate-in',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            plate,
            driver,
            weight,
            product
          })

        }
      )

      await res.json()

      setPlate('')
      setDriver('')
      setWeight('')
      setProduct('')

      setMessage(
        `✅ บันทึกรถ ${savePlate} สำเร็จ`
      )

      setTimeout(() => {

        setMessage('')

      }, 10000)

      plateRef.current?.focus()

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
  🚛 Gate In
</h1>

      {

        message && (

          <div className="notification-success">

            {message}

          </div>

        )

      }

      <div className="card form-card">

        <input
          ref={plateRef}
          type="text"
          placeholder="ທະບຽນລົດ"
          value={plate}
          onChange={(e) =>
            setPlate(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === 'Enter'
            ) {

              driverRef.current?.focus()

            }

          }}
          className="input"
        />

        <input
          ref={driverRef}
          type="text"
          placeholder="ຊື່ ຄົນຂັບລົດ"
          value={driver}
          onChange={(e) =>
            setDriver(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === 'Enter'
            ) {

              weightRef.current?.focus()

            }

          }}
          className="input"
        />

        <input
          ref={weightRef}
          type="number"
          placeholder="ນ້ຳໜັກ KG "
          value={weight}
          onChange={(e) =>
            setWeight(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === 'Enter'
            ) {

              productRef.current?.focus()

            }

          }}
          className="input"
        />

        <input
          ref={productRef}
          type="text"
          placeholder="ສິນຄ້າ"
          value={product}
          onChange={(e) =>
            setProduct(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === 'Enter'
            ) {

              saveData()

            }

          }}
          className="input"
        />

        <button
          onClick={saveData}
          className="btn-primary"
        >

          💾 ບັນທືກຂໍ້ມູນ

        </button>

      </div>

    </div>

  )

}

export default GateIn