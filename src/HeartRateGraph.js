import {useState} from "react";
import {useEffect} from "react";
import bluetooth_uuids from "./bluetooth_variables";
import {Chart} from "react-google-charts";

function HeartRateGraph({serviceName='heart_rate', characteristicName='heart_rate_measurement'}) {
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
            {(characteristic !== null) ? <HeartRateGraphBox characteristic={characteristic} characteristicName = {characteristicName} /> : null}
        </div>
    );
}


const ConnectDeviceButton = ({clickAction}) => {
    return (<button
        onClick={clickAction}
    >Connect Device</button>)
}

const TextBox = ({customText}) => {
    return (<p>Device Name: {customText}</p>)
}

const HeartRateGraphBox = ({characteristic, characteristicName}) => {
    const [value, setValue] = useState("0")

    const [int, setInt] = useState(0)
    const [data, setData] = useState([['Interval', 'Value']])


    const valueChangedHandler = (event) => {
        const value = event.currentTarget.value;

        if(characteristicName === 'cycling_power_measurement') {
            // How to determine what function and byteoffset I have NO IDEA :(.
            const dataView = new DataView(value.buffer);
            const power = dataView.getInt16(2, true);
            setValue(power);
        }

        if(characteristicName === 'heart_rate_measurement') {
            const heart_rate = event.target.value.getUint8(1);
            setValue(event.target.value.getUint8(1));
            setInt(int+1);
            setData([...data, [int, heart_rate]])



        }

    }

    useEffect(() => {
        async function getCharactertisticValue() {
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', valueChangedHandler);
        }
        getCharactertisticValue();
    })


    return (
        <div>
            <p>Current Value = {value}</p>
        <Chart
        chartType="LineChart"
        data={data}
        width="100%"
        height="400px"
    />
            </div>);

}

export default HeartRateGraph;
