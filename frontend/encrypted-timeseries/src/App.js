import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios'; 
const socket = io('http://localhost:4444'); 

const App = (props) => {
    const [realTimeData, setRealTimeData] = useState([])
    const [databaseData, setDatabaseData] = useState([])
    const [timestamp, setTimestamp] = useState('')
    const [loading, setLoading] = useState(true) 
    const [timestampLoading, setTimestampLoading] = useState(true) 

    useEffect(() => {
        // Listen for the 'dataSaved' event from the server (real-time data)
        socket.on('dataSaved', (receivedData) => {
            setTimestampLoading(false) // Timestamp is not loading
            setTimestamp(receivedData.timestamp)
            setRealTimeData(receivedData.data)
        })

        // Set up a timer to periodically fetch database data (e.g., every 5 seconds)
        const dataFetchInterval = setInterval(() => {
            fetchDataFromDatabase()
        }, 5000)

        // Clean up the event listener and timer when the component unmounts
        return () => {
            socket.off('dataSaved')
            clearInterval(dataFetchInterval)
        }
    }, [])

    const fetchDataFromDatabase = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/data')
            console.log(response.data)
            setDatabaseData(response.data)
            setLoading(false) // Data has loaded
        } catch (error) {
            console.error('Error fetching database data:', error)
            setLoading(false) // Handle error and set loading to false
        }
    }

    return (
        <div>
            <h1>Socket.IO Real-Time Data</h1>
            {timestampLoading ? (
                <p><strong>Timestamp:</strong> Loading...</p>
            ) : (
                <p><strong>Timestamp:</strong> {timestamp}</p>
            )}
            <ul>
                {realTimeData.map((item, index) => (
                    <li key={index}>
                        <p><strong>Name:</strong> {item.name}</p>
                        <p><strong>Origin:</strong> {item.origin}</p>
                        <p><strong>Destination:</strong> {item.destination}</p>
                    </li>
                ))}
            </ul>
            {!loading && <h1>Database Data</h1> }
            {loading ? (
                <p>Loading...</p>
            ) : (
                databaseData.length > 0 ? (
                    <table border="1">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Data</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {databaseData.map((entry, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <ul>
                                            {entry.data.map((item, subIndex) => (
                                                <li key={subIndex}>
                                                    <p><strong>Name:</strong> {item.name}</p>
                                                    <p><strong>Origin:</strong> {item.origin}</p>
                                                    <p><strong>Destination:</strong> {item.destination}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>{entry.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No data available</p>
                )
            )}
        </div>
    )
}

export default App
