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

      <h1
        style={{
          fontSize:'42px',
          marginBottom:'25px',
          color:'#1f2937'
        }}
      >
        🔄 Sync Center
      </h1>

      <div style={cardStyle}>

        <div
          style={{
            fontSize:'60px',
            textAlign:'center',
            marginBottom:'15px'
          }}
        >
          🔄
        </div>

        <h2
          style={{
            textAlign:'center',
            marginBottom:'10px'
          }}
        >
          Auto Sync
        </h2>

        <p
          style={{
            textAlign:'center',
            color:'#64748b',
            marginBottom:'20px'
          }}
        >
          Every 30 Seconds
        </p>

        <div style={infoBoxStyle}>

          <div style={labelStyle}>
            Last Sync
          </div>

          <div style={valueStyle}>
            {lastSync}
          </div>

        </div>

        <button
          onClick={syncNow}
          style={buttonStyle}
        >
          🚀 Sync Now
        </button>

      </div>

    </div>

  )

}

const cardStyle = {

  background:'white',

  padding:'35px',

  borderRadius:'20px',

  maxWidth:'700px',

  border:
    '1px solid #e2e8f0',

  boxShadow:
    '0 10px 25px rgba(15,23,42,.06)'

}

const infoBoxStyle = {

  background:'#f8fafc',

  padding:'20px',

  borderRadius:'15px',

  marginBottom:'20px',

  border:
    '1px solid #e2e8f0'

}

const labelStyle = {

  fontSize:'14px',

  color:'#64748b',

  marginBottom:'8px'

}

const valueStyle = {

  fontSize:'18px',

  fontWeight:'600',

  color:'#0f172a'

}

const buttonStyle = {

  width:'100%',

  padding:'15px',

  border:'none',

  background:'#2563eb',

  color:'white',

  borderRadius:'12px',

  cursor:'pointer',

  fontWeight:'600',

  fontSize:'16px'

}

export default Sync