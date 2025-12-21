import { MapContainer, TileLayer } from "react-leaflet";
import "./map.scss";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";
import { getCityCoordinates } from "../../lib/cityCoordinates";
import { useSearchParams } from "react-router-dom";

function Map({ items, city }) {
  const [searchParams] = useSearchParams();
  
  // 优先使用传入的city参数，否则从URL参数中获取
  const cityName = city || searchParams.get("city") || "";
  
  // 计算地图中心点
  const getMapCenter = () => {
    // 如果只有一个item，使用该item的坐标
    if (items.length === 1) {
      return [items[0].latitude, items[0].longitude];
    }
    
    // 如果有多个items，计算所有items的中心点
    if (items.length > 1) {
      const avgLat = items.reduce((sum, item) => sum + parseFloat(item.latitude || 0), 0) / items.length;
      const avgLng = items.reduce((sum, item) => sum + parseFloat(item.longitude || 0), 0) / items.length;
      return [avgLat, avgLng];
    }
    
    // 如果没有items，根据城市名称设置中心点
    return getCityCoordinates(cityName);
  };

  const center = getMapCenter();
  
  // 根据是否有数据调整缩放级别
  const zoom = items.length === 0 ? 10 : items.length === 1 ? 13 : 7;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
    </MapContainer>
  );
}

export default Map;
