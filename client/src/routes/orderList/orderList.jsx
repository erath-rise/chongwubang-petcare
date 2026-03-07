import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import OrderCard from "../../components/order/OrderCard";
import "./orderList.scss";

function OrderList() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [role, status, page, currentUser]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (role !== "all") params.append("role", role);
      if (status !== "all") params.append("status", status);
      params.append("page", page);
      params.append("limit", limit);

      const response = await apiRequest.get(`/orders?${params}`);
      setOrders(response.data.orders);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      console.error("获取订单列表失败:", err);
      setError(err.response?.data?.message || "获取订单列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setPage(1);
    setSearchParams({ role: newRole, status });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
    setSearchParams({ role, status: newStatus });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orderListPage">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orderListPage">
      <div className="container">
        <div className="header">
          <h1>我的订单</h1>
        </div>

        <div className="filters">
          <div className="filterGroup">
            <label>角色筛选：</label>
            <div className="filterButtons">
              <button
                className={role === "all" ? "active" : ""}
                onClick={() => handleRoleChange("all")}
              >
                全部
              </button>
              <button
                className={role === "user" ? "active" : ""}
                onClick={() => handleRoleChange("user")}
              >
                作为客户
              </button>
              <button
                className={role === "sitter" ? "active" : ""}
                onClick={() => handleRoleChange("sitter")}
              >
                作为护理员
              </button>
            </div>
          </div>

          <div className="filterGroup">
            <label>状态筛选：</label>
            <div className="filterButtons">
              <button
                className={status === "all" ? "active" : ""}
                onClick={() => handleStatusChange("all")}
              >
                全部
              </button>
              <button
                className={status === "pending" ? "active" : ""}
                onClick={() => handleStatusChange("pending")}
              >
                待接单
              </button>
              <button
                className={status === "accepted" ? "active" : ""}
                onClick={() => handleStatusChange("accepted")}
              >
                已接单
              </button>
              <button
                className={status === "in_progress" ? "active" : ""}
                onClick={() => handleStatusChange("in_progress")}
              >
                进行中
              </button>
              <button
                className={status === "completed" ? "active" : ""}
                onClick={() => handleStatusChange("completed")}
              >
                已完成
              </button>
              <button
                className={status === "cancelled" ? "active" : ""}
                onClick={() => handleStatusChange("cancelled")}
              >
                已取消
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="errorMessage">
            <p>{error}</p>
          </div>
        )}

        <div className="ordersList">
          {orders.length === 0 ? (
            <div className="emptyState">
              <p>暂无订单</p>
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>

        {total > limit && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </button>
            <span>
              第 {page} 页，共 {Math.ceil(total / limit)} 页
            </span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderList;

