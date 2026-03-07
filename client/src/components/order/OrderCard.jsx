import { Link } from "react-router-dom";
import "./orderCard.scss";

function OrderCard({ order }) {
  const getStatusText = (status) => {
    const statusMap = {
      pending: "待接单",
      accepted: "已接单",
      in_progress: "进行中",
      completed: "已完成",
      cancelled: "已取消",
      reviewed: "已评价",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending: "status-pending",
      accepted: "status-accepted",
      in_progress: "status-progress",
      completed: "status-completed",
      cancelled: "status-cancelled",
      reviewed: "status-reviewed",
    };
    return classMap[status] || "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Link to={`/orders/${order.id}`} className="orderCard">
      <div className="orderHeader">
        <div className="orderNumber">订单号：{order.orderNumber}</div>
        <div className={`status ${getStatusClass(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>
      
      <div className="orderContent">
        <div className="serviceInfo">
          <div className="serviceType">
            <span className="icon">🐾</span>
            <span>{order.serviceType}</span>
          </div>
          <div className="serviceDate">
            <span className="icon">📅</span>
            <span>{formatDate(order.serviceDate)}</span>
          </div>
          <div className="serviceTime">
            <span className="icon">⏰</span>
            <span>{order.startTime} - {order.endTime}</span>
          </div>
        </div>

        <div className="orderInfo">
          {order.sitter && (
            <div className="sitterInfo">
              <img
                src={order.sitter.avatar || order.sitter.user?.avatar || "/noavatar.jpg"}
                alt={order.sitter.name || order.sitter.user?.username}
              />
              <span>{order.sitter.name || order.sitter.user?.username}</span>
            </div>
          )}
          
          {order.user && (
            <div className="userInfo">
              <img
                src={order.user.avatar || "/noavatar.jpg"}
                alt={order.user.username}
              />
              <span>{order.user.username}</span>
            </div>
          )}

          <div className="price">
            <span className="label">价格：</span>
            <span className="value">¥{order.totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="orderFooter">
        <div className="createdAt">
          创建时间：{formatDate(order.createdAt)}
        </div>
      </div>
    </Link>
  );
}

export default OrderCard;

