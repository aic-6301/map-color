import { useEffect, useState } from 'react';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import './simpleMap.css';
import Sidebar from './Sidebar';
import { Button } from '@mui/material';

const SimpleMap = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [cityColors, setCityColors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch('/japan.json')
      .then(response => {
        console.log('Response:', response); // デバッグ用ログ
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON data:', data); // デバッグ用ログ
        setGeoData(data);
        const cityNames = data.features.map((feature: any) => feature.properties.N03_003 || feature.properties.N03_004);
        const uniqueCityNames: string[] = Array.from(new Set(cityNames)); // 型を明示的に指定
        console.log('Unique city names:', uniqueCityNames); // デバッグ用ログ
        setCities(uniqueCityNames);
      })
      .catch(error => console.error('Error fetching the GeoJSON data:', error));
  }, []);

  const geoJSONStyle = (feature: any) => {
    const cityName = feature.properties.N03_003 || feature.properties.N03_004;
    return {
      color: selectedCities.includes(cityName) ? cityColors[cityName] || 'blue' : 'transparent',
      weight: selectedCities.includes(cityName) ? 2 : 0,
      fillColor: selectedCities.includes(cityName) ? cityColors[cityName] || 'blue' : 'transparent',
      fillOpacity: selectedCities.includes(cityName) ? 0.5 : 0,
    };
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCities(prevSelectedCities =>
      prevSelectedCities.includes(cityName)
        ? prevSelectedCities.filter(city => city !== cityName)
        : [...prevSelectedCities, cityName]
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleColorChange = (cityName: string, color: string) => {
    setCityColors(prevColors => ({
      ...prevColors,
      [cityName]: color
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const MapWithSidebar = () => {
    const map = useMap();
    return (
      <Sidebar
        cities={cities}
        selectedCities={selectedCities}
        onCitySelect={(cityName) => handleCitySelect(cityName)}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sidebarOpen={sidebarOpen}
        onColorChange={handleColorChange}
        cityColors={cityColors}
      />
    );
  };

  return (
    <div style={{ display: 'flex', margin: '0 auto', backgroundColor: '#ffffff' }}>
      <Button
        variant="contained"
        color="primary"
        className="toggle-button"
        onClick={toggleSidebar}
        style={{ position: 'fixed', bottom: '20px', left: '10px', zIndex: 1001 }}
      >
        {sidebarOpen ? '←' : '→'}
      </Button>
      <MapContainer
        center={new LatLng(34.99096863821259, 137.00793794535102)}
        maxZoom={13}
        zoom={10}
        minZoom={6}  // 最小ズームレベルを設定
        style={{ flex: 1, backgroundColor: '#ffffff' }}
      >
        <TileLayer
          attribution='© <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png"
        />
        {geoData && <GeoJSON data={geoData} style={geoJSONStyle} />}
        <MapWithSidebar />
      </MapContainer>
    </div>
  );
};

export default SimpleMap;