import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";

function Pin({ item }) {
  // 支持自定义链接路径，如果没有提供则使用默认路径
  const linkPath = item.linkPath || `/${item.id}`;
  
  return (
    <Marker position={[item.latitude, item.longitude]}>
      <Popup>
        <div className="popupContainer w-full h-full bg-white rounded-md">
          <img src={item.images[0]} alt="" className="w-16 h-16 object-cover rounded-md" />
          <div className="pr-6 flex flex-col gap-2">
            <Link to={linkPath}>{item.title}</Link>
            <b>¥ {item.price}</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
