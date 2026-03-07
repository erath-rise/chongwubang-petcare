import { useState, useEffect } from "react";
import {
  getDashboardStats,
  getUserActivityTrend,
  getOrderTrend,
  getOrderStatusDistribution,
  getServiceTypeDistribution,
} from "../../../lib/adminApi";
import "./dashboard.scss";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [userTrend, setUserTrend] = useState([]);
  const [orderTrend, setOrderTrend] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [serviceType, setServiceType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, userTrendRes, orderTrendRes, statusRes, serviceRes] =
        await Promise.all([
          getDashboardStats(),
          getUserActivityTrend(30),
          getOrderTrend(30),
          getOrderStatusDistribution(),
          getServiceTypeDistribution(),
        ]);

      setStats(statsRes.data);
      setUserTrend(userTrendRes.data);
      setOrderTrend(orderTrendRes.data);
      setOrderStatus(statusRes.data);
      setServiceType(serviceRes.data);
      setError(null);
    } catch (err) {
      console.error("获取统计数据失败:", err);
      setError(err.response?.data?.message || "获取统计数据失败");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="errorMessage">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>数据统计面板</h1>
        <button onClick={fetchAllData} className="refresh-btn">
          🔄 刷新数据
        </button>
      </div>

      {/* 关键指标卡片 */}
      <div className="stats-grid">
        <StatCard
          title="总用户数"
          value={stats?.users?.total || 0}
          subtitle={`本月新增: ${stats?.users?.newThisMonth || 0}`}
          icon="👥"
          color="#6366f1"
        />
        <StatCard
          title="总订单数"
          value={stats?.orders?.total || 0}
          subtitle={`待处理: ${stats?.orders?.pending || 0}`}
          icon="📦"
          color="#10b981"
        />
        <StatCard
          title="总交易额"
          value={formatCurrency(stats?.revenue?.total || 0)}
          subtitle={`本月: ${formatCurrency(stats?.revenue?.thisMonth || 0)}`}
          icon="💰"
          color="#f59e0b"
        />
        <StatCard
          title="护理员总数"
          value={stats?.sitters?.total || 0}
          subtitle={`活跃: ${stats?.sitters?.active || 0}`}
          icon="🐾"
          color="#ec4899"
        />
      </div>

      {/* 详细统计 */}
      <div className="stats-details">
        <div className="detail-card">
          <h3>用户统计</h3>
          <div className="detail-content">
            <div className="detail-item">
              <span className="label">今日新增用户:</span>
              <span className="value">{stats?.users?.newToday || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">本月新增用户:</span>
              <span className="value">{stats?.users?.newThisMonth || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">本月活跃用户:</span>
              <span className="value">{stats?.users?.activeThisMonth || 0}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>订单统计</h3>
          <div className="detail-content">
            <div className="detail-item">
              <span className="label">今日订单:</span>
              <span className="value">{stats?.orders?.today || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">本月订单:</span>
              <span className="value">{stats?.orders?.thisMonth || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">已完成订单:</span>
              <span className="value">{stats?.orders?.completed || 0}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>护理员统计</h3>
          <div className="detail-content">
            <div className="detail-item">
              <span className="label">平均评分:</span>
              <span className="value">{stats?.sitters?.avgRating || 0}</span>
            </div>
            <div className="detail-item">
              <span className="label">活跃护理员:</span>
              <span className="value">{stats?.sitters?.active || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 订单状态分布 */}
      <div className="distribution-card">
        <h3>订单状态分布</h3>
        <div className="distribution-list">
          {orderStatus.map((item) => (
            <div key={item.status} className="distribution-item">
              <span className="status-label">{getStatusLabel(item.status)}</span>
              <div className="status-bar">
                <div
                  className="status-fill"
                  style={{
                    width: `${
                      stats?.orders?.total
                        ? (item.count / stats.orders.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="status-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 服务类型分布 */}
      <div className="distribution-card">
        <h3>服务类型分布</h3>
        <div className="distribution-list">
          {serviceType.map((item) => (
            <div key={item.serviceType} className="distribution-item">
              <span className="status-label">{item.serviceType}</span>
              <div className="status-bar">
                <div
                  className="status-fill"
                  style={{
                    width: `${
                      stats?.orders?.total
                        ? (item._count.serviceType / stats.orders.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="status-count">{item._count.serviceType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 趋势数据表格 */}
      <div className="trend-section">
        <div className="trend-card">
          <h3>用户活跃度趋势（最近30天）</h3>
          <div className="trend-table">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>新增用户</th>
                  <th>活跃用户</th>
                </tr>
              </thead>
              <tbody>
                {userTrend.slice(-7).map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.newUsers}</td>
                    <td>{item.activeUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="trend-card">
          <h3>订单趋势（最近30天）</h3>
          <div className="trend-table">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>订单数</th>
                  <th>完成数</th>
                  <th>收入</th>
                </tr>
              </thead>
              <tbody>
                {orderTrend.slice(-7).map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.orders}</td>
                    <td>{item.completed}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon" style={{ color }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  </div>
);

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

export default Dashboard;

