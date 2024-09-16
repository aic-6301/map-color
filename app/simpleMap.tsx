import { useEffect, useState } from 'react';
import { LatLng, LatLngBounds, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Marker as LeafletMarker, Popup } from 'react-leaflet';
import './simpleMap.css';
import Sidebar from './Sidebar';
import { Button } from '@mui/material';

// Leafletのデフォルトアイコンを設定
const defaultIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const SimpleMap = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [prefectures, setPrefectures] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [cityColors, setCityColors] = useState<{ [key: string]: string }>({});
  const [selectedLayer, setSelectedLayer] = useState<string>('blank');
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

    fetch('/prefectures.json')
      .then(response => response.json())
      .then(data => {
        const prefectureNames = data.features.map((prefecture: any) => prefecture.properties.N03_001);
        const uniquePrefectureNames: string[] = Array.from(new Set(prefectureNames)); // 型を明示的に指定
        console.log('Unique prefecture names:', uniquePrefectureNames); // デバッグ用ログ
        setPrefectures(uniquePrefectureNames);
      })
      .catch(error => console.error('Error fetching the prefectures data:', error));
  }, []);

  const geoJSONStyle = (feature: any) => {
    const cityName = feature.properties.N03_003 || feature.properties.N03_004;
    const prefectureName = feature.properties.N03_001;
    const isSelectedCity = selectedCities.includes(cityName);
    const isSelectedPrefecture = selectedPrefectures.includes(prefectureName);
    const color = cityColors[cityName] || cityColors[prefectureName] || 'blue';

    return {
      color: isSelectedCity || isSelectedPrefecture ? color : 'transparent',
      weight: isSelectedCity || isSelectedPrefecture ? 2 : 0,
      fillColor: isSelectedCity || isSelectedPrefecture ? color : 'transparent',
      fillOpacity: isSelectedCity || isSelectedPrefecture ? 0.5 : 0,
    };
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCities(prevSelectedCities =>
      prevSelectedCities.includes(cityName)
        ? prevSelectedCities.filter(city => city !== cityName)
        : [...prevSelectedCities, cityName]
    );
  };

  const handlePrefectureSelect = (prefectureName: string) => {
    setSelectedPrefectures(prevSelectedPrefectures =>
      prevSelectedPrefectures.includes(prefectureName)
        ? prevSelectedPrefectures.filter(prefecture => prefecture !== prefectureName)
        : [...prevSelectedPrefectures, prefectureName]
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleColorChange = (name: string, color: string) => {
    setCityColors(prevColors => ({
      ...prevColors,
      [name]: color
    }));
  };

  const handleLayerChange = (layer: string) => {
    setSelectedLayer(layer);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const MapWithSidebar = () => {
    useMapEvents({
      click(e) {
        if (!isDeleting) {
          setMarkers((prevMarkers) => [...prevMarkers, e.latlng]);
        }
        setIsDeleting(false); // リセット
      }
    });
    return (
      <Sidebar
        cities={cities}
        prefectures={prefectures}
        selectedCities={selectedCities}
        selectedPrefectures={selectedPrefectures}
        onCitySelect={(cityName) => handleCitySelect(cityName)}
        onPrefectureSelect={(prefectureName) => handlePrefectureSelect(prefectureName)}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        sidebarOpen={sidebarOpen}
        onColorChange={handleColorChange}
        cityColors={cityColors}
        selectedLayer={selectedLayer}
        onLayerChange={handleLayerChange}
      />
    );
  };

  const handleMarkerRemove = (index: number) => {
    setIsDeleting(true);
    setMarkers(markers.filter((_, i) => i !== index));
  };

  // 移動範囲の境界を設定
  const bounds = new LatLngBounds(
    new LatLng(10.0, 100.0), // 南西の座標
    new LatLng(50.0, 170.0)  // 北東の座標
  );

  const getTileLayerUrl = () => {
    switch (selectedLayer) {
      case 'pale':
        return "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png";
      case 'photo':
        return "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg";
      case 'blank':
      default:
        return "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png";
    }
  };

  const getMaxZoom = () => {
    switch (selectedLayer) {
      case 'pale':
      case 'photo':
        return 18;
      case 'blank':
      default:
        return 13;
    }
  };

  return (
    <div style={{ display: 'flex', margin: '0 auto', backgroundColor: '#ffffff' }}>
      <Button
        variant="contained"
        color="primary"
        className="toggle-button"
        onClick={toggleSidebar}
        style={{ left: sidebarOpen ? '420px' : '20px' }}
      >
        {sidebarOpen ? '←' : '→'}
      </Button>
      <div className={`map-container ${sidebarOpen ? 'shifted' : ''}`}>
        <MapContainer
          center={new LatLng(34.99096863821259, 137.00793794535102)}
          maxZoom={getMaxZoom()}
          zoom={10}
          minZoom={6}  // 最小ズームレベルを設定
          maxBounds={bounds}  // 移動範囲の境界を設定
          style={{ height: '100vh', width: '100%' }}
        >
          <TileLayer
            attribution='© <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
            url={getTileLayerUrl()}
          />
          {geoData && <GeoJSON data={geoData} style={geoJSONStyle} />}
          {markers.map((position, index) => (
            <LeafletMarker key={index} position={position} icon={defaultIcon}>
              <Popup>
                <Button variant="contained" color="secondary" onClick={() => handleMarkerRemove(index)}>
                  削除
                </Button>
              </Popup>
            </LeafletMarker>
          ))}
          <MapWithSidebar />
        </MapContainer>
      </div>
    </div>
  );
};

export default SimpleMap;