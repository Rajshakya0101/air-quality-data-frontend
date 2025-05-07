import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { DotWave } from 'ldrs/react';  // Importing the loader
import 'ldrs/react/DotWave.css';  // Importing the required CSS for the loader

const AirQualityTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [states, setStates] = useState([]);
  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({
    state: '',
    station: '',
    dateFrom: '',
    dateTo: '',
  });
  const [tableLoading, setTableLoading] = useState(false); // State for table data loading

  // Fetch states from backend
  useEffect(() => {
    axios.get('https://air-quality-data-backend.onrender.com/api/states')
      .then((response) => setStates(response.data))
      .catch((err) => console.log('Error fetching states:', err));
  }, []);

  // Fetch stations for selected state
  useEffect(() => {
    if (filters.state) {
      axios.get(`https://air-quality-data-backend.onrender.com/api/stations/${filters.state}`)
        .then((response) => setStations(response.data))
        .catch((err) => console.log('Error fetching stations:', err));
    } else {
      setStations([]);
    }
  }, [filters.state]);

  // Fetch air quality data (already flattened by backend)
  useEffect(() => {
    setTableLoading(true); // Start loader when data fetching begins
    axios.get('https://air-quality-data-backend.onrender.com/api/air-quality')
      .then((response) => {
        setData(response.data);
        setFilteredData(response.data);
        setTableLoading(false); // Stop loader once data is fetched
      })
      .catch((err) => {
        console.log('Error fetching data:', err);
        setTableLoading(false); // Stop loader in case of an error
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...data];
    if (filters.state) {
      filtered = filtered.filter((item) => item.state === filters.state);
    }
    if (filters.station) {
      filtered = filtered.filter((item) => item.station_name === filters.station);
    }
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.date) >= new Date(filters.dateFrom) &&
          new Date(item.date) <= new Date(filters.dateTo)
      );
    }
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      station: '',
      dateFrom: '',
      dateTo: '',
    });
    setFilteredData(data);
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Air Quality Data');
    XLSX.writeFile(wb, 'air_quality_data.xlsx');
  };

  return (
    <div className="p-5">
      {/* Table Filter Section */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* State Dropdown */}
        <select
          name="state"
          value={filters.state}
          onChange={handleFilterChange}
          className="p-2 border rounded cursor-pointer"
        >
          <option value="">Select State</option>
          {states.map((state, index) => (
            <option key={index} value={state}>{state}</option>
          ))}
        </select>

        {/* Station Dropdown */}
        <select
          name="station"
          value={filters.station}
          onChange={handleFilterChange}
          className="p-2 border rounded cursor-pointer"
        >
          <option value="">Select Station</option>
          {stations.map((station, index) => (
            <option key={index} value={station}>{station}</option>
          ))}
        </select>

        {/* Date Range */}
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="p-2 border rounded cursor-pointer"
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="p-2 border rounded cursor-pointer"
        />

        {/* Buttons */}
        <button
          onClick={applyFilters}
          className="p-2 bg-blue-500 text-white rounded cursor-pointer"
        >
          Apply Filters
        </button>
        <button
          onClick={handleDownloadExcel}
          className="p-2 bg-green-500 text-white rounded cursor-pointer"
        >
          Download Excel
        </button>
        <button
          onClick={clearFilters}
          className="p-2 bg-red-500 text-white rounded cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Table Loader */}
      {tableLoading && (
        <div className="flex justify-center items-center py-60">
          <DotWave size="47" speed="1" color="blue" /> {/* Display DotWave loader */}
        </div>
      )}

      {/* Data Table */}
      {!tableLoading && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Station</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">AQI</th>
                <th className="px-4 py-2 border">PM2.5</th>
                <th className="px-4 py-2 border">PM10</th>
                <th className="px-4 py-2 border">SO2</th>
                <th className="px-4 py-2 border">NO2</th>
                <th className="px-4 py-2 border">O3</th>
                <th className="px-4 py-2 border">CO</th>
                <th className="px-4 py-2 border">Temp</th>
                <th className="px-4 py-2 border">Wind</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{item.station_name}</td>
                  <td className="px-4 py-2 border">{item.date}</td>
                  <td className="px-4 py-2 border">{item.aqi}</td>
                  <td className="px-4 py-2 border">{item.pm25}</td>
                  <td className="px-4 py-2 border">{item.pm10}</td>
                  <td className="px-4 py-2 border">{item.so2}</td>
                  <td className="px-4 py-2 border">{item.no2}</td>
                  <td className="px-4 py-2 border">{item.o3}</td>
                  <td className="px-4 py-2 border">{item.co}</td>
                  <td className="px-4 py-2 border">{item.temp}</td>
                  <td className="px-4 py-2 border">{item.wind}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AirQualityTable;
