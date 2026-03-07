import { useState, useEffect } from "react";
import { getSitters } from "../../../lib/adminApi";
import "./sitterManagement.scss";

const SitterManagement = () => {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchSitters();
  }, [page]);

  const fetchSitters = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };

      const response = await getSitters(params);
      setSitters(response.data.sitters);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error("获取护理员列表失败:", err);
      setError(err.response?.data?.message || "获取护理员列表失败");
    } finally {
      setLoading(false);
    }
  };

  if (loading && sitters.length === 0) {
    return (
      <div className="sitterManagement">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sitterManagement">
      <div className="header">
        <h1>护理员管理</h1>
      </div>

      {error && <div className="errorMessage">{error}</div>}

      {/* 护理员列表 */}
      <div className="sitters-grid">
        {sitters.map((sitter) => (
          <div key={sitter.id} className="sitter-card">
            <div className="sitter-header">
              <div className="sitter-avatar">
                {sitter.avatar ? (
                  <img src={sitter.avatar} alt={sitter.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {sitter.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="sitter-info">
                <h3>{sitter.name}</h3>
                <div className="sitter-rating">
                  <span className="rating-value">
                    ⭐ {sitter.rating?.toFixed(1) || 0}
                  </span>
                  <span className="review-count">
                    ({sitter.reviewCount || 0} 评价)
                  </span>
                </div>
              </div>
            </div>

            <div className="sitter-details">
              <div className="detail-row">
                <span className="label">城市:</span>
                <span className="value">{sitter.city || "未知"}</span>
              </div>
              <div className="detail-row">
                <span className="label">基础价格:</span>
                <span className="value">
                  ¥{sitter.basePrice ? (sitter.basePrice / 100).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">订单数:</span>
                <span className="value">{sitter._count?.orders || 0}</span>
              </div>
              <div className="detail-row">
                <span className="label">评价数:</span>
                <span className="value">{sitter._count?.reviews || 0}</span>
              </div>
              {sitter.user && (
                <div className="detail-row">
                  <span className="label">关联用户:</span>
                  <span className="value">{sitter.user.username}</span>
                </div>
              )}
            </div>

            {sitter.description && (
              <div className="sitter-description">
                <p>{sitter.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {sitters.length === 0 && !loading && (
        <div className="empty-state">
          <p>暂无护理员数据</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default SitterManagement;

