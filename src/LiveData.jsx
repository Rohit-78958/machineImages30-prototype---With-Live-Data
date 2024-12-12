import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

function LiveDataDisplay({ machineID, distanceFactor = 8, position}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const keys = ['AE', 'PE', 'OEE', 'DownTime', 'PartCount', 'key6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://xxx.xx.0.64:8016/api/GetMachineDetails?machineID=' + machineID);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        console.log('Fetched data:', jsonData);
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchData, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [machineID]);
  

  return (
    <Html distanceFactor={distanceFactor} position={position}>
      <div className="bg-white/90 p-4 rounded-lg shadow-lg min-w-[350px]">
        {/* Machine Name */}
        <h2 className="text-lg font-bold text-center mb-3">
          {/* {machineNames[machineID] || `Machine ${machineID}`} */}
          Rohit
        </h2>
      </div>
      <div className="bg-white/90 p-4 rounded-lg shadow-lg min-w-[200px]">
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : !data ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="text-sm">
            <h3 className="font-bold mb-2 text-center">Live Machine Data</h3>
            <div className="space-y-1">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{keys[key]}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

export default LiveDataDisplay;
