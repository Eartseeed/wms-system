import { useEffect, useState } from 'react'

function Sync() {

  const [lastSync, setLastSync] =
    useState('-')

  const syncNow = async () => {

    try {

      const localData =
        await fetch(
          'http://localhost:3001/gate-in'
        )

      const rows =
        await localData.json()

      await fetch(

        'http://localhost:3001/sync-data',

        {

          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify(rows)

        }

      )

      setLastSync(
        new Date()
          .toLocaleString()
      )

    } catch (err) {

      console.log(err)

    }

  }

  useEffect(() => {

    syncNow()

    const timer =
      setInterval(
        syncNow,
        30000
      )

    return () =>
      clearInterval(timer)

  }, [])

  return (

    <div>

      <h1>
        🔄 Sync Center
      </h1>

      <div style={cardStyle}>

        <h2>
          Auto Sync
        </h2>

        <p>
          Every 30 Seconds
        </p>

        <p>
          Last Sync :
          {lastSync}
        </p>

        <button
          onClick={syncNow}
          style={buttonStyle}
        >
          Sync Now
        </button>

      </div>

    </div>

  )

}

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '15px'
}

const buttonStyle = {
  padding: '12px 20px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  borderRadius: '8px'
}

export default Sync