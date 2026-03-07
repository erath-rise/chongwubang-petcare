import { useState, useEffect } from "react";
import { getOrders, getOrderDetail } from "../../../lib/adminApi";
import "./orderManagement.scss";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(status && { status }),
      };

      const response = await getOrders(params);
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error("获取订单列表失败:", err);
      setError(err.response?.data?.message || "获取订单列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      const response = await getOrderDetail(orderId);
      setSelectedOrder(response.data);
      setShowDetail(true);
    } catch (err) {
      console.error("获取订单详情失败:", err);
      alert(err.response?.data?.message || "获取订单详情失败");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount / 100);
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "待接单",
      accepted: "已接单",
      in_progress: "进行中",
      completed: "已完成",
      cancelled: "已取消",
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "pending",
      accepted: "accepted",
      in_progress: "in-progress",
      completed: "completed",
      cancelled: "cancelled",
    };
    return classes[status] || "";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orderManagement">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orderManagement">
      <div className="header">
        <h1>订单管理</h1>
      </div>

      {/* 筛选 */}
      <div className="filters">
        <div className="filter-group">
          <label>订单状态:</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="status-select"
          >
            <option value="">全部状态</option>
            <option value="pending">待接单</option>
            <option value="accepted">已接单</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
      </div>

      {error && <div className="errorMessage">{error}</div>}

      {/* 订单列表 */}
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>用户</th>
              <th>护理员</th>
              <th>服务类型</th>
              <th>服务日期</th>
              <th>总价</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>
                  <div className="user-info">
                    {order.user?.avatar && (
                      <img
                        src={order.user.avatar}
                        alt={order.user.username}
                        className="avatar"
                      />
                    )}
                    <span>{order.user?.username || "未知"}</span>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    {order.sitter?.avatar && (
                      <img
                        src={order.sitter.avatar}
                        alt={order.sitter.name}
                        className="avatar"
                      />
                    )}
                    <span>{order.sitter?.name || "未知"}</span>
                  </div>
                </td>
                <td>{order.serviceType}</td>
                <td>
                  {new Date(order.serviceDate).toLocaleDateString("zh-CN")}
                </td>
                <td>{formatCurrency(order.totalPrice)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td>
                  {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td>
                  <button
                    onClick={() => handleViewDetail(order.id)}
                    className="btn-view"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="pagination">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          上一页
        </button>
        <span>
          第 {page} 页 / 共 {totalPages} 页
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          下一页
        </button>
      </div>

      {/* 订单详情模态框 */}
      {showDetail && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>订单详情 - {selectedOrder.orderNumber}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>基本信息</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>订单号:</label>
                    <span>{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>状态:</label>
                    <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>服务类型:</label>
                    <span>{selectedOrder.serviceType}</span>
                  </div>
                  <div className="detail-item">
                    <label>服务日期:</label>
                    <span>
                      {new Date(selectedOrder.serviceDate).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>服务时间:</label>
                    <span>
                      {selectedOrder.startTime} - {selectedOrder.endTime}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>总价:</label>
                    <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                  </div>
                </div>

                <h3>用户信息</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>用户名:</label>
                    <span>{selectedOrder.user?.username || "未知"}</span>
                  </div>
                  <div className="detail-item">
                    <label>邮箱:</label>
                    <span>{selectedOrder.user?.email || "未知"}</span>
                  </div>
                </div>

                <h3>护理员信息</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>姓名:</label>
                    <span>{selectedOrder.sitter?.name || "未知"}</span>
                  </div>
                  <div className="detail-item">
                    <label>评分:</label>
                    <span>{selectedOrder.sitter?.rating || 0}</span>
                  </div>
                </div>

                {selectedOrder.petName && (
                  <>
                    <h3>宠物信息</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>宠物名称:</label>
                        <span>{selectedOrder.petName}</span>
                      </div>
                      {selectedOrder.petType && (
                        <div className="detail-item">
                          <label>宠物类型:</label>
                          <span>{selectedOrder.petType}</span>
                        </div>
                      )}
                      {selectedOrder.petSize && (
                        <div className="detail-item">
                          <label>宠物大小:</label>
                          <span>{selectedOrder.petSize}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <h3>时间信息</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>创建时间:</label>
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  {selectedOrder.acceptedAt && (
                    <div className="detail-item">
                      <label>接单时间:</label>
                      <span>
                        {new Date(selectedOrder.acceptedAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  )}
                  {selectedOrder.completedAt && (
                    <div className="detail-item">
                      <label>完成时间:</label>
                      <span>
                        {new Date(selectedOrder.completedAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

