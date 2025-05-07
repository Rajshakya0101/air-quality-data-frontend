import React from 'react';
import AirQualityTable from './AirQualityTable';

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Air Quality Dashboard</h1>
      </header>
      <main className="p-5">
        <AirQualityTable />
      </main>
    </div>
  );
};

export default App;
