import { useState, useEffect } from "react";
import { getUsers, getUserDetail, updateUserStatus } from "../../../lib/adminApi";
import "./userManagement.scss";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, search, role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(role && { role }),
      };

      const response = await getUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error("获取用户列表失败:", err);
      setError(err.response?.data?.message || "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (userId) => {
    try {
      const response = await getUserDetail(userId);
      setSelectedUser(response.data);
      setShowDetail(true);
    } catch (err) {
      console.error("获取用户详情失败:", err);
      alert(err.response?.data?.message || "获取用户详情失败");
    }
  };

  const handleUpdateStatus = async (userId, updates) => {
    try {
      await updateUserStatus(userId, updates);
      alert("更新成功！");
      fetchUsers();
      if (selectedUser?.id === userId) {
        handleViewDetail(userId);
      }
    } catch (err) {
      console.error("更新用户状态失败:", err);
      alert(err.response?.data?.message || "更新用户状态失败");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "从未登录";
    return new Date(dateString).toLocaleString("zh-CN");
  };

  if (loading && users.length === 0) {
    return (
      <div className="userManagement">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="userManagement">
      <div className="header">
        <h1>用户管理</h1>
      </div>

      {/* 搜索和筛选 */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="role-select"
          >
            <option value="">所有角色</option>
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
      </div>

      {error && <div className="errorMessage">{error}</div>}

      {/* 用户列表 */}
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="avatar"
                      />
                    )}
                    <span>{user.username}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === "admin" ? "管理员" : "普通用户"}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${user.isActive ? "active" : "inactive"}`}
                  >
                    {user.isActive ? "正常" : "禁用"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("zh-CN")}</td>
                <td>{formatDate(user.lastLoginAt)}</td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => handleViewDetail(user.id)}
                      className="btn-view"
                    >
                      查看
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(user.id, {
                          isActive: !user.isActive,
                        })
                      }
                      className={`btn-toggle ${user.isActive ? "disable" : "enable"}`}
                    >
                      {user.isActive ? "禁用" : "启用"}
                    </button>
                  </div>
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

      {/* 用户详情模态框 */}
      {showDetail && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>用户详情</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetail(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-item">
                  <label>用户名:</label>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="detail-item">
                  <label>邮箱:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-item">
                  <label>角色:</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      handleUpdateStatus(selectedUser.id, {
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
                <div className="detail-item">
                  <label>状态:</label>
                  <select
                    value={selectedUser.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      handleUpdateStatus(selectedUser.id, {
                        isActive: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">正常</option>
                    <option value="inactive">禁用</option>
                  </select>
                </div>
                <div className="detail-item">
                  <label>注册时间:</label>
                  <span>
                    {new Date(selectedUser.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <div className="detail-item">
                  <label>最后登录:</label>
                  <span>{formatDate(selectedUser.lastLoginAt)}</span>
                </div>
                {selectedUser._count && (
                  <>
                    <div className="detail-item">
                      <label>订单数:</label>
                      <span>{selectedUser._count.orders || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>帖子数:</label>
                      <span>{selectedUser._count.posts || 0}</span>
                    </div>
                  </>
                )}
                {selectedUser.sitter && (
                  <div className="detail-item">
                    <label>护理员信息:</label>
                    <span>
                      {selectedUser.sitter.name} (评分:{" "}
                      {selectedUser.sitter.rating})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

