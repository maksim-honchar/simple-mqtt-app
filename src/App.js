import * as mqtt from "mqtt/dist/mqtt"
import { useEffect, useState, useCallback } from "react"



function App() {
	const [clientConnect, setConnectClient] = useState(null)
	const [connectionStatus, setConnectionStatus] = useState(false)
	const [payload, setPayload] = useState([])
	const [topicName, setTopicName] = useState('')


	const mqttConnect = () => {
	const client = mqtt.connect(`ws://broker.emqx.io:8083/mqtt`)
		setConnectClient(client)
	}

	const mqttDisconnect = useCallback(() => {
		clientConnect?.unsubscribe('testtopic/react')
		clientConnect?.end(() => {
			setConnectionStatus(false)
			setTopicName(`unsubscribed`)
		})
	}, [clientConnect])

	const mqttConnectDisconnect = () => {
		if (connectionStatus) {
			mqttDisconnect()
		} else {
			mqttConnect()
		}
	}

	useEffect(() => {
		mqttConnect()
	}, [])

	useEffect(() => {
		if (clientConnect) {
			clientConnect.on('connect', () => setConnectionStatus(true))
			clientConnect.subscribe('testtopic/react')
			clientConnect.on('message', (topic, message) => {
				const messageString = message.toString()
				const messageObject = JSON.parse(messageString)
				const { msg } = messageObject
				const newMessage = { topic, message: msg }
				setTopicName(topic)
				setPayload([...payload, newMessage])
			})
		} else {
			mqttDisconnect()
		}
	}, [clientConnect, mqttDisconnect, payload])

	const messagesList = payload.map((newMessage, index) => <p key={index}>{newMessage.message}</p>)

  return (
		<div>
			<h2>{connectionStatus ? 'Connected to server' : 'Not connected to server'}</h2>
			<h3>topic: {topicName}</h3>
			<button onClick={mqttConnectDisconnect}>{connectionStatus ? 'Disconect' : 'Connect'}</button>
			{messagesList}
		</div>
  );
}

export default App;
