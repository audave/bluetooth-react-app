import './App.css';
import {useState} from "react";
import {useEffect} from "react";

function App() {
    const [device, setDevice] = useState(null);
    const [gattServer, setGattServer] = useState(null);
    const [deviceService, setDeviceService] = useState(null);
    const [characteristic, setCharacteristic] = useState(null);

    navigator.bluetooth.addEventListener('onserviceadded', function (event) {
        console.log(event)
    })

    const handleButtonPush = async () => {
        const device = await navigator.bluetooth
            .requestDevice({
                filters: [
                    {services: ["battery_service"]}
                ],
                optionalServices: ['battery_service'],
            })
        setDevice(device)
        const server = await device.gatt.connect()
        setGattServer(server)
        const service = await server.getPrimaryService('battery_service');
        setDeviceService(service);
        const characteristic = await service.getCharacteristic('battery_level')
        setCharacteristic(characteristic);
    }

    return (
        <div className="App">
            <ConnectDeviceButton clickAction={handleButtonPush}/>
            {(device !== null) ? <TextBox customText={device.name}/> : null}
            {(characteristic !== null) ? <BlueToothDeviceCharateristic characteristic={characteristic}/> : null}
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

const BlueToothDeviceCharateristic = ({characteristic}) => {
    const [value, setValue] = useState("0")
    const [count, setCount] = useState(0);

    const test = (event) => {
        console.log(event.timeStamp);
        console.log(count);
        console.log(event);
        // setValue(event.target.value.getUint8(0));
        // setCount(count +1)
    }

    useEffect(() => {
        async function getCharactertisticValue() {
            characteristic.readValue().then((readValue) => {
                    setValue(readValue.getUint8(0));
                }
            );
        }

        getCharactertisticValue();
    })
    characteristic.addEventListener('characteristicvaluechanged', test);
    return (<div><p>Battery Level is {value} %</p></div>)
}

export default App;
