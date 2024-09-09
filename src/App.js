import './App.css';
import {useState} from "react";
import {useEffect} from "react";
import BlueToothDevice from "./BlueToothDevice";

function App() {
    const [intervalData, setintervalData] = useState(null);
    const [intervalNumber, setIntervalNumber] = useState(0);

    const finishInterval = () => {
        setIntervalNumber(intervalNumber + 1);
    }
    
    useEffect(() => {
        // Replace 'your-json-url' with the actual URL of your JSON file
        fetch('/programData.json')
            .then(response => response.json())
            .then(jsonData => setintervalData(jsonData.intervals))
            .catch(error => console.error('Error fetching JSON:', error));
    }, []);

    return (
        <div className="App">
            {intervalData !== null && intervalNumber < intervalData.length ? (
                    <TimerBox finishIntervalHandler={finishInterval} intervalDetails={intervalData[intervalNumber]}/>)
                : (<p>No data loaded</p>)
            }

            <BlueToothDevice serviceName='heart_rate' characteristicName='heart_rate_measurement' valueFunction='getUint8' byteOffset='1' />
            <BlueToothDevice serviceName='cycling_power' characteristicName='cycling_power_measurement' valueFunction='getUint16' byteOffset='0' />
        </div>
    );
}

const TextBox = ({customText}) => {
    return (<p>Device: Name {customText}</p>)
}

const TimerBox = ({finishIntervalHandler, intervalDetails}) => {
    const [timerValue, setTimerValue] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setTimerValue(timerValue + 1);
            if (timerValue === intervalDetails.interval) {
                finishIntervalHandler();
                setTimerValue(0)
            }
        }, 1000)
    })

    return (<div>
        <p>Count = {timerValue}</p>
        <p>Interval name = {intervalDetails.name}</p>
        <p>Interval name = {intervalDetails.color}</p>
    </div>)
}
export default App;
