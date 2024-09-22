import { useEffect, useState, useRef } from 'react';
import { LatLng, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './simpleMap.css';
import Sidebar from './Sidebar';
import { Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SimpleMap = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [prefectures, setPrefectures] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [cityColors, setCityColors] = useState<{ [key: string]: string }>({});
  const [selectedLayer, setSelectedLayer] = useState<string>('standard');
  const [zoomLevel, setZoomLevel] = useState<number>(10); // ズームレベルの状態を追加
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/japan.json')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        const cityNames = data.features.map((feature: any) => {
          const cityName = feature.properties.N03_003;
          const wardName = feature.properties.N03_004;
          return cityName ? (wardName ? `${cityName}${wardName}` : cityName) : wardName;
        });
        const uniqueCityNames: string[] = Array.from(new Set(cityNames));
        setCities(uniqueCityNames);
      })
      .catch(error => console.error('Error fetching the GeoJSON data:', error));

    fetch('/prefectures.json')
      .then(response => response.json())
      .then(data => {
        const prefectureNames = data.features.map((prefecture: any) => prefecture.properties.N03_001);
        const uniquePrefectureNames: string[] = Array.from(new Set(prefectureNames));
        setPrefectures(uniquePrefectureNames);
      })
      .catch(error => console.error('Error fetching the prefectures data:', error));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    console.log(key);
    if (key) {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const { cities, prefectures, cityColors, selectedLayer } = JSON.parse(savedData);
        setSelectedCities(cities);
        setSelectedPrefectures(prefectures);
        setCityColors(cityColors);
        setSelectedLayer(selectedLayer);
      }
    }
  }, []);

  const geoJSONStyle = (feature: any) => {
    const cityName = feature.properties.N03_003;
    const wardName = feature.properties.N03_004;
    const fullName = cityName ? (wardName ? `${cityName}${wardName}` : cityName) : wardName;
    const prefectureName = feature.properties.N03_001;
    const isSelectedCity = selectedCities.includes(fullName);
    const isSelectedPrefecture = selectedPrefectures.includes(prefectureName);
    const color = cityColors[fullName] || cityColors[prefectureName] || 'blue';

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

  const generateShareableURL = () => {
    const key = Math.random().toString(36).substring(2, 10); // ランダムなキーを生成
    const data = {
      cities: selectedCities,
      prefectures: selectedPrefectures,
      cityColors: cityColors,
      selectedLayer: selectedLayer
    };
    localStorage.setItem(key, JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?key=${key}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('共有URLがクリップボードにコピーされました\n※今のところ、共有URLはこのブラウザでのみ有効です。');
    });
  };

  const MapWithSidebar = () => {
    const map = useMap();

    useEffect(() => {
      const handleScroll = (e: Event) => {
        e.stopPropagation();
      };
      const sidebarElement = sidebarRef.current;
      if (sidebarElement) {
        sidebarElement.addEventListener('wheel', handleScroll);
      }
      return () => {
        if (sidebarElement) {
          sidebarElement.removeEventListener('wheel', handleScroll);
        }
      };
    }, []);

    useEffect(() => {
      const onZoomEnd = () => {
        setZoomLevel(map.getZoom());
      };
      map.on('zoomend', onZoomEnd);
      return () => {
        map.off('zoomend', onZoomEnd);
      };
    }, [map]);

    useMapEvents({
      click: (event) => {
        if (!sidebarOpen) {
          handleMapClick(event);
        }
      },
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
        setMapClickEnabled={(enabled) => console.log(enabled)} // Add this line
      />
    );
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
      case 'standard':
      default:
        return "https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png";
    }
  };

  const getMaxZoom = () => {
    switch (selectedLayer) {
      case 'pale':
      case 'photo':
        return 18;
      case 'standard':
      default:
        return 13;
    }
  };

  const handleMapClick = (event: any) => {
    const { latlng } = event;
    const buffer = 0.001; // バッファのサイズを調整
    const bufferedBounds = L.latLngBounds(
      [latlng.lat - buffer, latlng.lng - buffer],
      [latlng.lat + buffer, latlng.lng + buffer]
    );
  
    let closestCity = null;
    let minDistance = Infinity;
  
    geoData.features.forEach((feature: any) => {
      const layer = L.geoJSON(feature);
      if (layer.getBounds().intersects(bufferedBounds)) {
        const cityName = feature.properties.N03_003;
        const wardName = feature.properties.N03_004;
        const fullName = cityName ? (wardName ? `${cityName}${wardName}` : cityName) : wardName;
        const center = layer.getBounds().getCenter();
        const distance = latlng.distanceTo(center);
  
        if (distance < minDistance) {
          closestCity = fullName;
          minDistance = distance;
        }
      }
    });
  
    if (closestCity && !selectedCities.includes(closestCity)) {
      handleCitySelect(closestCity);
    }
  };

  return (
    <div
      style={{ display: 'flex', margin: '0 auto', backgroundColor: '#ffffff' }}
    >
      <Button
        variant="contained"
        color="primary"
        className="toggle-button"
        onClick={toggleSidebar}
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          left: sidebarOpen ? '340px' : '20px', 
          zIndex: 1002
        }}
      >
        {sidebarOpen ? '←' : '→'}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={generateShareableURL}
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: 1001 
        }}
      >
        共有
      </Button>
      <MapContainer
        center={new LatLng(34.99096863821259, 137.00793794535102)}
        maxZoom={getMaxZoom()}
        zoom={10}
        minZoom={6}  // 最小ズームレベルを設定
        maxBounds={bounds}  // 移動範囲の境界を設定
        style={{ flex: 1, backgroundColor: '#ffffff' }}
      >
        <TileLayer
          attribution='© <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url={getTileLayerUrl()}
        />
        {geoData && <GeoJSON data={geoData} style={geoJSONStyle} />}
        {zoomLevel >= 10 ? (
          selectedCities.map(cityName => {
            const cityFeature = geoData.features.find((feature: any) => {
              const name = feature.properties.N03_003;
              const ward = feature.properties.N03_004;
              const fullName = name ? (ward ? `${name}${ward}` : name) : ward;
              return fullName === cityName;
            });
            if (!cityFeature) return null;
            const center = L.geoJSON(cityFeature).getBounds().getCenter();
            return (
              <Marker
                key={cityName}
                position={center}
                icon={L.divIcon({
                  className: 'city-label',
                  html: `<div style="background-color: white; padding: 2px 5px; border-radius: 3px; white-space: nowrap; text-align: center; transform: translate(-50%, -50%);">${cityName}</div>`,
                  iconSize: [100, 40], // アイコンのサイズを指定
                  iconAnchor: [50, 20], // アイコンのアンカーを中心に設定
                })}
              />
            );
          })
        ) : (
          selectedPrefectures.map(prefectureName => {
            const prefectureFeature = geoData.features.find((feature: any) => {
              return feature.properties.N03_001 === prefectureName;
            });
            if (!prefectureFeature) return null;
            const center = L.geoJSON(prefectureFeature).getBounds().getCenter();
            return (
              <Marker
                key={prefectureName}
                position={center}
                icon={L.divIcon({
                  className: 'city-label',
                  html: `<div style="background-color: white; padding: 2px 5px; border-radius: 3px; white-space: nowrap; text-align: center; transform: translate(-50%, -50%);">${prefectureName}</div>`,
                  iconSize: [100, 40], // アイコンのサイズを指定
                  iconAnchor: [50, 20], // アイコンのアンカーを中心に設定
                })}
              />
            );
          })
        )}
        <MapWithSidebar />
      </MapContainer>
      <ToastContainer />
    </div>
  );
};

export default SimpleMap;