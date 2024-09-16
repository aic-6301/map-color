import Leaflet from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = Leaflet.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerIconShadow.src,
  iconAnchor: [12, 41], // アイコンのオフセット
  popupAnchor: [0, -32], // ポップアップのオフセット
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;