import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import bluetooth_uuids from "./bluetooth_variables";

function App() {
    const [device, setDevice] = useState(null);
    const [gattServer, setGattServer] = useState(null);
    const [deviceService, setDeviceService] = useState(null);
    const [characteristic, setCharacteristic] = useState(null);

    const handleButtonPush = async () => {
        const device = await navigator.bluetooth
            .requestDevice({
                filters: [{ services: ['heart_rate'] }]
            })
        setDevice(device)
        const server = await device.gatt.connect()
        setGattServer(server)
        const service = await server.getPrimaryService('heart_rate');
        setDeviceService(service);
        const characteristic = await service.getCharacteristic('heart_rate_measurement')
        setCharacteristic(characteristic);
    }

    return (
        <div className="App">
            <ConnectDeviceButton clickAction={handleButtonPush}/>
            {(device !== null) ? <TextBox customText={device.name}/> : null}
            {(characteristic !== null) ? <BlueToothDeviceCharateristic characteristic={characteristic} characteristicName = 'Heart Rate'/> : null}
        </div>
    );
}


const ConnectDeviceButton = ({clickAction}) => {
    return (<button
        onClick={clickAction}
    >Connect Device</button>)
}

const TextBox = ({customText}) => {
    return (<p>Device: Name {customText}</p>)
}

const BlueToothDeviceCharateristic = ({characteristic, characteristicName}) => {
    const [value, setValue] = useState("0")

    const valueChangedHandler = (event) => {
        setValue(event.target.value.getUint8(1));
    }

    useEffect(() => {
        async function getCharactertisticValue() {
            characteristic.addEventListener('characteristicvaluechanged', valueChangedHandler);
            await characteristic.startNotifications();
        }

        getCharactertisticValue();
    })

    return (<div><p>{characteristicName} is {value}</p></div>)
}

export default App;
