import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import { cityCoordinates } from "../../lib/cityCoordinates";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import "./sitterPostPage.scss";

function SitterPostPage() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  // 基本信息
  const [name, setName] = useState(currentUser?.username || "");
  const [avatar, setAvatar] = useState([currentUser?.avatar || ""]);
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  
  // 位置信息
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  // 价格
  const [basePrice, setBasePrice] = useState("");
  
  // 资质认证
  const [certifications, setCertifications] = useState([""]);
  
  // 服务列表
  const [services, setServices] = useState([
    { serviceType: "遛狗", price: "", description: "", duration: "" }
  ]);
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // 服务类型选项
  const serviceTypes = ["遛狗", "宠物寄养", "上门照看", "日间照看"];

  // 城市列表
  const cities = Object.keys(cityCoordinates);

  // 处理城市变化，自动填充经纬度
  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    if (cityCoordinates[selectedCity]) {
      const [lat, lng] = cityCoordinates[selectedCity];
      setLatitude(lat.toString());
      setLongitude(lng.toString());
    }
  };

  // 添加资质认证
  const addCertification = () => {
    setCertifications([...certifications, ""]);
  };

  // 更新资质认证
  const updateCertification = (index, value) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };

  // 删除资质认证
  const removeCertification = (index) => {
    if (certifications.length > 1) {
      const updated = certifications.filter((_, i) => i !== index);
      setCertifications(updated);
    }
  };

  // 添加服务
  const addService = () => {
    // 找到还没有添加的服务类型
    const usedTypes = services.map(s => s.serviceType);
    const availableType = serviceTypes.find(t => !usedTypes.includes(t));
    if (availableType) {
      setServices([...services, { serviceType: availableType, price: "", description: "", duration: "" }]);
    }
  };

  // 更新服务
  const updateService = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  // 删除服务
  const removeService = (index) => {
    if (services.length > 1) {
      const updated = services.filter((_, i) => i !== index);
      setServices(updated);
    }
  };

  // 验证当前步骤
  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!name.trim()) {
          setError("请输入您的姓名");
          return false;
        }
        if (!description.trim()) {
          setError("请输入个人简介");
          return false;
        }
        break;
      case 2:
        if (!city) {
          setError("请选择城市");
          return false;
        }
        if (!address.trim()) {
          setError("请输入详细地址");
          return false;
        }
        break;
      case 3:
        if (!basePrice || parseInt(basePrice) <= 0) {
          setError("请输入有效的基础价格");
          return false;
        }
        for (let i = 0; i < services.length; i++) {
          if (!services[i].price || parseInt(services[i].price) <= 0) {
            setError(`请为"${services[i].serviceType}"服务输入有效价格`);
            return false;
          }
        }
        break;
      default:
        break;
    }
    setError("");
    return true;
  };

  // 下一步
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 创建护理员
      const sitterData = {
        name,
        avatar: avatar[0] || null,
        description,
        experience: experience || null,
        city,
        address,
        latitude,
        longitude,
        basePrice: parseInt(basePrice),
        certifications: certifications.filter(c => c.trim() !== ""),
      };

      const sitterRes = await apiRequest.post("/sitters", sitterData);
      const sitterId = sitterRes.data.id;

      // 添加服务
      for (const service of services) {
        if (service.price && parseInt(service.price) > 0) {
          await apiRequest.post(`/sitters/${sitterId}/services`, {
            serviceType: service.serviceType,
            price: parseInt(service.price),
            description: service.description || null,
            duration: service.duration ? parseInt(service.duration) : null,
          });
        }
      }

      // 成功后跳转到护理员详情页
      navigate(`/sitters/${sitterId}`);
    } catch (err) {
      console.error("创建护理员失败:", err);
      setError(err.response?.data?.message || "创建失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取服务图标
  const getServiceIcon = (serviceType) => {
    const icons = {
      "遛狗": "🚶",
      "宠物寄养": "🏠",
      "上门照看": "🏡",
      "日间照看": "☀️",
    };
    return icons[serviceType] || "🐾";
  };

  return (
    <div className="sitterPostPage">
      {/* 进度指示器 */}
      <div className="progressBar">
        <div className="progressSteps">
          <div className={`progressStep ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="stepNumber">1</div>
            <span className="stepLabel">基本信息</span>
          </div>
          <div className="progressLine"></div>
          <div className={`progressStep ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="stepNumber">2</div>
            <span className="stepLabel">位置信息</span>
          </div>
          <div className="progressLine"></div>
          <div className={`progressStep ${step >= 3 ? 'active' : ''}`}>
            <div className="stepNumber">3</div>
            <span className="stepLabel">服务与定价</span>
          </div>
        </div>
      </div>

      <div className="formContainer">
        <div className="formHeader">
          <h1>🐾 成为宠物护理员</h1>
          <p>加入宠物帮，开始您的宠物护理事业</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 步骤 1: 基本信息 */}
          {step === 1 && (
            <div className="formStep">
              <div className="stepTitle">
                <span className="stepIcon">👤</span>
                <h2>基本信息</h2>
              </div>

              <div className="formGroup avatarGroup">
                <label>头像</label>
                <div className="avatarUpload">
                  <div className="avatarPreview">
                    {avatar[0] ? (
                      <img src={avatar[0]} alt="头像预览" />
                    ) : (
                      <div className="avatarPlaceholder">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <UploadWidget
                    uwConfig={{
                      cloudName: "lamadev",
                      uploadPreset: "estate",
                      folder: "avatars",
                      multiple: false,
                      maxImageFileSize: 2000000,
                    }}
                    setState={setAvatar}
                  />
                </div>
              </div>

              <div className="formGroup">
                <label htmlFor="name">
                  姓名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="description">
                  个人简介 <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="介绍一下您自己，让宠物主人更了解您..."
                  rows={4}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="experience">工作经验</label>
                <input
                  type="text"
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="例如：3年宠物护理经验"
                />
              </div>

              <div className="formGroup certificationsGroup">
                <label>资质认证</label>
                <div className="certificationsWrapper">
                  {certifications.map((cert, index) => (
                    <div key={index} className="certificationItem">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => updateCertification(index, e.target.value)}
                        placeholder="例如：宠物护理师证书"
                      />
                      {certifications.length > 1 && (
                        <button
                          type="button"
                          className="removeBtn"
                          onClick={() => removeCertification(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="addBtn" onClick={addCertification}>
                    + 添加认证
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 2: 位置信息 */}
          {step === 2 && (
            <div className="formStep">
              <div className="stepTitle">
                <span className="stepIcon">📍</span>
                <h2>位置信息</h2>
              </div>

              <div className="formGroup">
                <label htmlFor="city">
                  城市 <span className="required">*</span>
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  required
                >
                  <option value="">选择城市</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formGroup">
                <label htmlFor="address">
                  详细地址 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="请输入详细地址，例如：朝阳区建国门外大街1号"
                  required
                />
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="latitude">纬度</label>
                  <input
                    type="text"
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="自动填充"
                    readOnly
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="longitude">经度</label>
                  <input
                    type="text"
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="自动填充"
                    readOnly
                  />
                </div>
              </div>

              <div className="locationHint">
                💡 选择城市后，经纬度将自动填充
              </div>
            </div>
          )}

          {/* 步骤 3: 服务与定价 */}
          {step === 3 && (
            <div className="formStep">
              <div className="stepTitle">
                <span className="stepIcon">💰</span>
                <h2>服务与定价</h2>
              </div>

              <div className="formGroup">
                <label htmlFor="basePrice">
                  基础起价 (元) <span className="required">*</span>
                </label>
                <div className="priceInputWrapper">
                  <span className="pricePrefix">¥</span>
                  <input
                    type="number"
                    id="basePrice"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="请输入基础起价"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="servicesSection">
                <label>提供的服务 <span className="required">*</span></label>
                <div className="servicesWrapper">
                  {services.map((service, index) => (
                    <div key={index} className="serviceCard">
                      <div className="serviceHeader">
                        <span className="serviceIcon">{getServiceIcon(service.serviceType)}</span>
                        <select
                          value={service.serviceType}
                          onChange={(e) => updateService(index, "serviceType", e.target.value)}
                        >
                          {serviceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {services.length > 1 && (
                          <button
                            type="button"
                            className="removeServiceBtn"
                            onClick={() => removeService(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="serviceDetails">
                        <div className="serviceField">
                          <label>价格 (元/次) <span className="required">*</span></label>
                          <div className="priceInputWrapper small">
                            <span className="pricePrefix">¥</span>
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) => updateService(index, "price", e.target.value)}
                              placeholder="价格"
                              min="1"
                              required
                            />
                          </div>
                        </div>

                        <div className="serviceField">
                          <label>时长 (分钟)</label>
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) => updateService(index, "duration", e.target.value)}
                            placeholder="时长"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="serviceField description">
                        <label>服务描述</label>
                        <textarea
                          value={service.description}
                          onChange={(e) => updateService(index, "description", e.target.value)}
                          placeholder="描述一下您的服务内容..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {services.length < serviceTypes.length && (
                    <button type="button" className="addServiceBtn" onClick={addService}>
                      <span>+</span> 添加更多服务
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && <div className="errorMessage">{error}</div>}

          {/* 导航按钮 */}
          <div className="formNavigation">
            {step > 1 && (
              <button type="button" className="prevBtn" onClick={prevStep}>
                ← 上一步
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="nextBtn" onClick={nextStep}>
                下一步 →
              </button>
            ) : (
              <button type="submit" className="submitBtn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    提交中...
                  </>
                ) : (
                  "🎉 完成注册"
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 侧边信息栏 */}
      <div className="sideInfo">
        <div className="infoCard">
          <div className="infoIcon">🌟</div>
          <h3>成为护理员的好处</h3>
          <ul>
            <li>💰 灵活的工作时间和收入</li>
            <li>🐕 与可爱的宠物共度时光</li>
            <li>🤝 加入友好的宠物爱好者社区</li>
            <li>🛡️ 享受平台保障和支持</li>
          </ul>
        </div>

        <div className="infoCard">
          <div className="infoIcon">📋</div>
          <h3>申请流程</h3>
          <ol>
            <li>填写基本信息</li>
            <li>设置服务区域</li>
            <li>配置服务项目和价格</li>
            <li>开始接单！</li>
          </ol>
        </div>

        <div className="previewCard">
          <h3>预览</h3>
          <div className="previewContent">
            <div className="previewAvatar">
              {avatar[0] ? (
                <img src={avatar[0]} alt="预览" />
              ) : (
                <div className="previewAvatarPlaceholder">👤</div>
              )}
            </div>
            <div className="previewInfo">
              <h4>{name || "您的姓名"}</h4>
              <p>{city ? `📍 ${city}` : "📍 选择城市"}</p>
              <p>{basePrice ? `¥${basePrice} 起` : "设置价格"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SitterPostPage;

