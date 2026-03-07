import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./orderDetail.scss";

function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
    images: [],
    tags: [],
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchOrder();
  }, [id, currentUser]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get(`/orders/${id}`);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error("获取订单详情失败:", err);
      setError(err.response?.data?.message || "获取订单详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await apiRequest.put(`/orders/${id}/accept`);
      await fetchOrder();
      alert("接单成功！");
    } catch (err) {
      alert(err.response?.data?.message || "接单失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setActionLoading(true);
      await apiRequest.put(`/orders/${id}/start`);
      await fetchOrder();
      alert("服务已开始！");
    } catch (err) {
      alert(err.response?.data?.message || "开始服务失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmComplete = async (confirmedBy) => {
    try {
      setActionLoading(true);
      await apiRequest.put(`/orders/${id}/confirm-complete`, { confirmedBy });
      await fetchOrder();
      alert("确认完成成功！");
    } catch (err) {
      alert(err.response?.data?.message || "确认完成失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("请输入取消原因：");
    if (!reason) return;

    if (!window.confirm("确定要取消此订单吗？")) return;

    try {
      setActionLoading(true);
      const cancelBy = order.userId === currentUser.id ? "user" : "sitter";
      await apiRequest.put(`/orders/${id}/cancel`, { reason, cancelBy });
      await fetchOrder();
      alert("订单已取消");
    } catch (err) {
      alert(err.response?.data?.message || "取消订单失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setActionLoading(true);
      await apiRequest.post(`/orders/${id}/review`, reviewData);
      await fetchOrder();
      setShowReviewForm(false);
      alert("评价成功！");
    } catch (err) {
      alert(err.response?.data?.message || "评价失败");
    } finally {
      setActionLoading(false);
    }
  };

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
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const isSitter = order?.sitter?.user?.id === currentUser?.id;
  const isUser = order?.userId === currentUser?.id;

  if (loading) {
    return (
      <div className="orderDetailPage">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="orderDetailPage">
        <div className="errorContainer">
          <h2>😕 出错了</h2>
          <p>{error || "订单未找到"}</p>
          <button onClick={() => navigate("/orders")} className="backButton">
            返回订单列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orderDetailPage">
      <div className="container">
        <div className="header">
          <button className="backButton" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          <div className="headerInfo">
            <h1>订单详情</h1>
            <div className={`status ${getStatusClass(order.status)}`}>
              {getStatusText(order.status)}
            </div>
          </div>
        </div>

        <div className="orderContent">
          <div className="mainSection">
            <div className="orderCard">
              <div className="orderHeader">
                <div className="orderNumber">订单号：{order.orderNumber}</div>
                <div className="price">¥{order.totalPrice}</div>
              </div>

              <div className="orderInfo">
                <div className="infoRow">
                  <span className="label">服务类型：</span>
                  <span className="value">{order.serviceType}</span>
                </div>
                <div className="infoRow">
                  <span className="label">服务日期：</span>
                  <span className="value">{formatDate(order.serviceDate)}</span>
                </div>
                <div className="infoRow">
                  <span className="label">服务时间：</span>
                  <span className="value">{order.startTime} - {order.endTime}</span>
                </div>
                {order.duration && (
                  <div className="infoRow">
                    <span className="label">服务时长：</span>
                    <span className="value">{order.duration} 分钟</span>
                  </div>
                )}
              </div>

              {order.petInfo && (
                <div className="petInfo">
                  <h3>宠物信息</h3>
                  <div className="infoRow">
                    {order.petName && (
                      <div>
                        <span className="label">宠物名称：</span>
                        <span className="value">{order.petName}</span>
                      </div>
                    )}
                    {order.petType && (
                      <div>
                        <span className="label">宠物类型：</span>
                        <span className="value">{order.petType}</span>
                      </div>
                    )}
                    {order.petSize && (
                      <div>
                        <span className="label">宠物大小：</span>
                        <span className="value">{order.petSize}</span>
                      </div>
                    )}
                  </div>
                  <p>{order.petInfo}</p>
                  {order.specialNeeds && (
                    <div className="specialNeeds">
                      <span className="label">特殊需求：</span>
                      <span>{order.specialNeeds}</span>
                    </div>
                  )}
                </div>
              )}

              {order.serviceAddress && (
                <div className="addressInfo">
                  <h3>服务地址</h3>
                  <p>{order.serviceAddress}</p>
                </div>
              )}

              {order.contactPhone && (
                <div className="contactInfo">
                  <h3>联系方式</h3>
                  <p>电话：{order.contactPhone}</p>
                  {order.contactNote && <p>备注：{order.contactNote}</p>}
                </div>
              )}
            </div>

            <div className="timeline">
              <h3>订单时间线</h3>
              <div className="timelineItem">
                <div className="timelineDot"></div>
                <div className="timelineContent">
                  <div className="timelineTitle">订单创建</div>
                  <div className="timelineTime">{formatDateTime(order.createdAt)}</div>
                </div>
              </div>
              {order.acceptedAt && (
                <div className="timelineItem">
                  <div className="timelineDot"></div>
                  <div className="timelineContent">
                    <div className="timelineTitle">护理员接单</div>
                    <div className="timelineTime">{formatDateTime(order.acceptedAt)}</div>
                  </div>
                </div>
              )}
              {order.startedAt && (
                <div className="timelineItem">
                  <div className="timelineDot"></div>
                  <div className="timelineContent">
                    <div className="timelineTitle">开始服务</div>
                    <div className="timelineTime">{formatDateTime(order.startedAt)}</div>
                  </div>
                </div>
              )}
              {order.completedAt && (
                <div className="timelineItem">
                  <div className="timelineDot"></div>
                  <div className="timelineContent">
                    <div className="timelineTitle">服务完成</div>
                    <div className="timelineTime">{formatDateTime(order.completedAt)}</div>
                  </div>
                </div>
              )}
              {order.cancelledAt && (
                <div className="timelineItem">
                  <div className="timelineDot cancelled"></div>
                  <div className="timelineContent">
                    <div className="timelineTitle">订单取消</div>
                    <div className="timelineTime">{formatDateTime(order.cancelledAt)}</div>
                    {order.cancelReason && (
                      <div className="cancelReason">原因：{order.cancelReason}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {order.userReview && (
              <div className="reviewSection">
                <h3>用户评价</h3>
                <div className="reviewCard">
                  <div className="reviewHeader">
                    <div className="reviewer">
                      <img
                        src={order.user?.avatar || "/noavatar.jpg"}
                        alt={order.user?.username}
                      />
                      <span>{order.user?.username}</span>
                    </div>
                    <div className="rating">
                      {"⭐".repeat(Math.floor(order.userReview.rating))}
                      {order.userReview.rating % 1 >= 0.5 && "⭐"}
                    </div>
                  </div>
                  {order.userReview.comment && (
                    <p className="reviewComment">{order.userReview.comment}</p>
                  )}
                  {order.userReview.tags && order.userReview.tags.length > 0 && (
                    <div className="reviewTags">
                      {order.userReview.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar">
            <div className="participants">
              <h3>参与人员</h3>
              {order.sitter && (
                <div className="participant">
                  <img
                    src={order.sitter.avatar || order.sitter.user?.avatar || "/noavatar.jpg"}
                    alt={order.sitter.name || order.sitter.user?.username}
                  />
                  <div>
                    <div className="participantName">
                      {order.sitter.name || order.sitter.user?.username}
                    </div>
                    <div className="participantRole">护理员</div>
                  </div>
                </div>
              )}
              {order.user && (
                <div className="participant">
                  <img
                    src={order.user.avatar || "/noavatar.jpg"}
                    alt={order.user.username}
                  />
                  <div>
                    <div className="participantName">{order.user.username}</div>
                    <div className="participantRole">客户</div>
                  </div>
                </div>
              )}
            </div>

            <div className="actions">
              {order.status === "pending" && isSitter && (
                <button
                  className="actionButton primary"
                  onClick={handleAccept}
                  disabled={actionLoading}
                >
                  {actionLoading ? "处理中..." : "接单"}
                </button>
              )}

              {order.status === "accepted" && isSitter && (
                <button
                  className="actionButton primary"
                  onClick={handleStart}
                  disabled={actionLoading}
                >
                  {actionLoading ? "处理中..." : "开始服务"}
                </button>
              )}

              {order.status === "in_progress" && (
                <>
                  {isUser && !order.userConfirmed && (
                    <button
                      className="actionButton primary"
                      onClick={() => handleConfirmComplete("user")}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "处理中..." : "确认完成"}
                    </button>
                  )}
                  {isSitter && !order.sitterConfirmed && (
                    <button
                      className="actionButton primary"
                      onClick={() => handleConfirmComplete("sitter")}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "处理中..." : "确认完成"}
                    </button>
                  )}
                </>
              )}

              {order.status === "completed" && isUser && !order.userReview && (
                <button
                  className="actionButton primary"
                  onClick={() => setShowReviewForm(true)}
                >
                  评价订单
                </button>
              )}

              {(order.status === "pending" || order.status === "accepted" || order.status === "in_progress") && (
                <button
                  className="actionButton danger"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  {actionLoading ? "处理中..." : "取消订单"}
                </button>
              )}
            </div>
          </div>
        </div>

        {showReviewForm && (
          <div className="reviewModal">
            <div className="reviewModalContent">
              <h3>评价订单</h3>
              <div className="reviewForm">
                <div className="formGroup">
                  <label>评分：</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, rating: parseFloat(e.target.value) })
                    }
                  >
                    <option value={5}>5 星</option>
                    <option value={4}>4 星</option>
                    <option value={3}>3 星</option>
                    <option value={2}>2 星</option>
                    <option value={1}>1 星</option>
                  </select>
                </div>
                <div className="formGroup">
                  <label>评价内容：</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, comment: e.target.value })
                    }
                    rows={4}
                    placeholder="请输入您的评价..."
                  />
                </div>
                <div className="formActions">
                  <button
                    className="cancelButton"
                    onClick={() => setShowReviewForm(false)}
                  >
                    取消
                  </button>
                  <button
                    className="submitButton"
                    onClick={handleReview}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "提交中..." : "提交评价"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;

