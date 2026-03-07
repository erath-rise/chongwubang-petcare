import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./createOrder.scss";

function CreateOrder() {
  const navigate = useNavigate();
  const { sitterId } = useParams();
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);

  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    serviceType: location.state?.serviceType || "",
    serviceDate: "",
    startTime: "",
    endTime: "",
    duration: 60,
    petName: "",
    petType: "",
    petSize: "",
    petInfo: "",
    specialNeeds: "",
    serviceAddress: "",
    latitude: "",
    longitude: "",
    contactPhone: "",
    contactNote: "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchSitter();
  }, [sitterId, currentUser]);

  const fetchSitter = async () => {
    try {
      setLoading(true);
      const response = await apiRequest.get(`/sitters/${sitterId}`);
      setSitter(response.data);
      if (response.data.services && response.data.services.length > 0 && !formData.serviceType) {
        setFormData(prev => ({
          ...prev,
          serviceType: response.data.services[0].serviceType,
        }));
      }
    } catch (err) {
      console.error("获取护理员信息失败:", err);
      setError(err.response?.data?.message || "获取护理员信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculatePrice = () => {
    if (!sitter || !formData.serviceType) return 0;
    const service = sitter.services?.find(s => s.serviceType === formData.serviceType);
    const basePrice = service?.price || sitter.basePrice || 0;
    return basePrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serviceType || !formData.serviceDate || !formData.startTime || !formData.endTime) {
      alert("请填写必填字段");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const orderData = {
        ...formData,
        sitterId,
        totalPrice: calculatePrice(),
        basePrice: calculatePrice(),
      };

      const response = await apiRequest.post("/orders", orderData);
      alert("订单创建成功！");
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      console.error("创建订单失败:", err);
      setError(err.response?.data?.message || "创建订单失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="createOrderPage">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !sitter) {
    return (
      <div className="createOrderPage">
        <div className="errorContainer">
          <h2>😕 出错了</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="backButton">
            返回
          </button>
        </div>
      </div>
    );
  }

  const selectedService = sitter?.services?.find(s => s.serviceType === formData.serviceType);

  return (
    <div className="createOrderPage">
      <div className="container">
        <div className="header">
          <button className="backButton" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          <h1>创建订单</h1>
        </div>

        <div className="content">
          <div className="mainForm">
            <form onSubmit={handleSubmit}>
              {sitter && (
                <div className="sitterInfo">
                  <img
                    src={sitter.avatar || sitter.user?.avatar || "/noavatar.jpg"}
                    alt={sitter.name || sitter.user?.username}
                  />
                  <div>
                    <h3>{sitter.name || sitter.user?.username}</h3>
                    <p>{sitter.description}</p>
                  </div>
                </div>
              )}

              <div className="formSection">
                <h2>服务信息</h2>
                
                <div className="formGroup">
                  <label>服务类型 <span className="required">*</span></label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">请选择服务类型</option>
                    {sitter?.services?.map((service) => (
                      <option key={service.id} value={service.serviceType}>
                        {service.serviceType} - ¥{service.price}/次
                      </option>
                    ))}
                  </select>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>服务日期 <span className="required">*</span></label>
                    <input
                      type="date"
                      name="serviceDate"
                      value={formData.serviceDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label>服务时长（分钟）</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min={30}
                      step={30}
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>开始时间 <span className="required">*</span></label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label>结束时间 <span className="required">*</span></label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="formSection">
                <h2>宠物信息</h2>
                
                <div className="formRow">
                  <div className="formGroup">
                    <label>宠物名称</label>
                    <input
                      type="text"
                      name="petName"
                      value={formData.petName}
                      onChange={handleInputChange}
                      placeholder="例如：旺财"
                    />
                  </div>

                  <div className="formGroup">
                    <label>宠物类型</label>
                    <select
                      name="petType"
                      value={formData.petType}
                      onChange={handleInputChange}
                    >
                      <option value="">请选择</option>
                      <option value="狗">狗</option>
                      <option value="猫">猫</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>

                  <div className="formGroup">
                    <label>宠物大小</label>
                    <select
                      name="petSize"
                      value={formData.petSize}
                      onChange={handleInputChange}
                    >
                      <option value="">请选择</option>
                      <option value="小型">小型</option>
                      <option value="中型">中型</option>
                      <option value="大型">大型</option>
                    </select>
                  </div>
                </div>

                <div className="formGroup">
                  <label>宠物信息</label>
                  <textarea
                    name="petInfo"
                    value={formData.petInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="例如：金毛，3岁，性格温顺"
                  />
                </div>

                <div className="formGroup">
                  <label>特殊需求</label>
                  <textarea
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="例如：需要避开其他狗狗"
                  />
                </div>
              </div>

              <div className="formSection">
                <h2>联系信息</h2>
                
                <div className="formGroup">
                  <label>服务地址</label>
                  <input
                    type="text"
                    name="serviceAddress"
                    value={formData.serviceAddress}
                    onChange={handleInputChange}
                    placeholder="请输入服务地址"
                  />
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>纬度</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="可选"
                    />
                  </div>

                  <div className="formGroup">
                    <label>经度</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="可选"
                    />
                  </div>
                </div>

                <div className="formGroup">
                  <label>联系电话</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="请输入联系电话"
                  />
                </div>

                <div className="formGroup">
                  <label>联系备注</label>
                  <textarea
                    name="contactNote"
                    value={formData.contactNote}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="例如：请提前10分钟到达"
                  />
                </div>
              </div>

              {error && (
                <div className="errorMessage">
                  <p>{error}</p>
                </div>
              )}

              <div className="formActions">
                <button
                  type="button"
                  className="cancelButton"
                  onClick={() => navigate(-1)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="submitButton"
                  disabled={submitting}
                >
                  {submitting ? "提交中..." : "提交订单"}
                </button>
              </div>
            </form>
          </div>

          <div className="sidebar">
            <div className="priceCard">
              <h3>价格明细</h3>
              <div className="priceRow">
                <span>基础价格：</span>
                <span>¥{calculatePrice()}</span>
              </div>
              <div className="priceRow total">
                <span>总计：</span>
                <span>¥{calculatePrice()}</span>
              </div>
              <p className="priceNote">* 价格仅供参考，不涉及实际支付</p>
            </div>

            {selectedService && (
              <div className="serviceInfo">
                <h3>服务说明</h3>
                <p>{selectedService.description || "无特殊说明"}</p>
                {selectedService.duration && (
                  <p className="serviceDuration">服务时长：{selectedService.duration} 分钟</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;

