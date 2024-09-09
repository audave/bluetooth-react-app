import {useState} from "react";
import {useEffect} from "react";
import bluetooth_uuids from "./bluetooth_variables";

function BlueToothDevice({serviceName, characteristicName, valueFunction, byteOffset}) {
    const [device, setDevice] = useState(null);
    const [characteristic, setCharacteristic] = useState(null);
    console.log(serviceName);

    const handleButtonPush = async () => {
        const device = await navigator.bluetooth
            .requestDevice({
                filters: [{ services: [serviceName] }]
            })
        setDevice(device)
        const server = await device.gatt.connect()
        const service = await server.getPrimaryService(serviceName);
        const characteristic = await service.getCharacteristic(characteristicName)
        setCharacteristic(characteristic);
    }

    return (
        <div className="BlueToothDevice">
            <ConnectDeviceButton clickAction={handleButtonPush}/>
            {(device !== null) ? <TextBox customText={device.name}/> : null}
            {(characteristic !== null) ? <BlueToothDeviceCharateristic characteristic={characteristic} characteristicName = {characteristicName}  valueFunction={valueFunction} byteOffset={byteOffset}/> : null}
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

const BlueToothDeviceCharateristic = ({characteristic, characteristicName, valueFunction, byteOffset}) => {
    console.log(characteristic)
    const [value, setValue] = useState("0")

    const valueChangedHandler = (event) => {
        const value = event.currentTarget.value;
        if(characteristicName === 'cycling_power_measurement') {
            const dataView = new DataView(value.buffer);
            const power = dataView.getInt16(2, true);
            setValue(power);
        }

        if(characteristicName === 'heart_rate_measurement') {
            setValue(event.target.value.getUint8(1));

        }

    }

    useEffect(() => {
        async function getCharactertisticValue() {
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', valueChangedHandler);

        }
        getCharactertisticValue();
    })

    return (<div><p>{characteristicName} is {value}</p></div>)
}

export default BlueToothDevice;
