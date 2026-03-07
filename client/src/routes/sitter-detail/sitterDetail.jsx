import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import Map from "../../components/map/Map";
import Chat from "../../components/chat/Chat";
import { AuthContext } from "../../context/AuthContext";
import "./sitterDetail.scss";

function SitterDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [petCount, setPetCount] = useState(1);
  const [selectedService, setSelectedService] = useState("遛狗");
  const [selectedMonth, setSelectedMonth] = useState(0); // 0: December 2025, 1: January 2026
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [receiver, setReceiver] = useState(null);

  // 从API获取护理员数据
  useEffect(() => {
    const fetchSitter = async () => {
      try {
        setLoading(true);
        const response = await apiRequest.get(`/sitters/${id}`);
        setSitter(response.data);
        setError(null);
      } catch (err) {
        console.error("获取护理员详情失败:", err);
        setError(err.response?.data?.message || "获取护理员信息失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSitter();
    }
  }, [id]);

  // 加载状态
  if (loading) {
    return (
      <div className="sitterDetailPage">
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !sitter) {
    return (
      <div className="sitterDetailPage">
        <div className="errorContainer">
          <h2>😕 出错了</h2>
          <p>{error || "未找到该护理员"}</p>
          <button onClick={() => navigate("/sitters")} className="backToListButton">
            返回护理员列表
          </button>
        </div>
      </div>
    );
  }

  // 数据映射和格式化
  const getServiceIcon = (serviceType) => {
    const icons = {
      "遛狗": "🚶",
      "宠物寄养": "🏠",
      "上门照看": "🏡",
      "日间照看": "☀️",
    };
    return icons[serviceType] || "🐾";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "1天前";
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}月前`;
  };

  // 格式化护理员数据以匹配原有结构
  const formattedSitter = {
    id: sitter.id,
    name: sitter.name,
    avatar: sitter.avatar || sitter.user?.avatar,
    images: sitter.avatar ? [
      sitter.avatar,
      sitter.avatar,
      sitter.avatar,
      sitter.avatar,
      sitter.avatar,
    ] : [
      "https://i.pravatar.cc/600?img=12",
      "https://i.pravatar.cc/600?img=13",
      "https://i.pravatar.cc/600?img=14",
      "https://i.pravatar.cc/600?img=15",
      "https://i.pravatar.cc/600?img=16",
    ],
    tagline: sitter.description,
    description: sitter.description,
    location: sitter.city,
    locationDetail: sitter.address,
    joinDate: formatDate(sitter.createdAt),
    experience: sitter.experience || "经验丰富",
    lastActive: getTimeSince(sitter.lastActive),
    rating: sitter.rating || 0,
    reviews: sitter.reviewCount || 0,
    services: sitter.services?.map(service => ({
      id: service.id,
      name: service.serviceType,
      icon: getServiceIcon(service.serviceType),
      description: service.description || `提供专业的${service.serviceType}服务`,
      price: service.price,
      pricePerExtra: Math.floor(service.price * 0.3), // 估算额外宠物价格为30%
      location: "您的家",
      duration: service.duration,
    })) || [],
    aboutHome: {
      type: "公寓",
      outdoorArea: "中等户外区域",
      address: sitter.address,
      lat: parseFloat(sitter.latitude) || 39.9042,
      lng: parseFloat(sitter.longitude) || 116.4074
    },
    about: sitter.description || `嗨！我是${sitter.name}，我热爱照顾宠物，有丰富的宠物护理经验。`,
    calendarUpdated: sitter.availability && sitter.availability.length > 0,
    cancellationPolicy: "如果您在预订前12小时前取消，可全额退款。",
    paymentMethods: ["mastercard", "visa", "amex", "apple-pay", "google-pay", "wechat", "alipay"],
    certifications: sitter.certifications || [],
    reviewsList: sitter.reviews || [], // 包含 sitterReview 和 orderReview
    orderReviews: sitter.orderReviews || [], // 单独的订单评价列表
    availability: sitter.availability || [],
  };

  const currentService = formattedSitter.services.find(s => s.name === selectedService) || formattedSitter.services[0] || {
    name: "暂无服务",
    price: 0,
    pricePerExtra: 0,
  };

  // 生成日历数据
  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const months = [
    { name: "12月 2025", month: 11, year: 2025 },
    { name: "1月 2026", month: 0, year: 2026 }
  ];

  const currentMonthData = months[selectedMonth];
  const calendarDays = generateCalendar(currentMonthData.month, currentMonthData.year);

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  // 处理联系按钮点击
  const handleContact = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!sitter || !sitter.userId) {
      alert("无法开始聊天：护理员信息无效");
      return;
    }

    try {
      // 尝试创建新聊天或获取现有聊天
      const chatResponse = await apiRequest.post("/chats", { receiverId: sitter.userId });
      console.log('Chat response:', chatResponse.data);

      // 获取该聊天的详细信息（包括消息）
      const chatDetailResponse = await apiRequest.get(`/chats/${chatResponse.data.id}`);
      console.log('Chat detail response:', chatDetailResponse.data);

      // 设置接收者信息
      const receiverInfo = {
        id: sitter.userId,
        username: sitter.name,
        avatar: sitter.avatar || sitter.user?.avatar,
      };

      setReceiver(receiverInfo);
      setCurrentChat(chatDetailResponse.data);
      setShowChat(true);
    } catch (err) {
      console.error('Error in handleContact:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 401) {
          navigate("/login");
        } else if (err.response.status === 404) {
          alert("未找到用户。请稍后再试。");
        } else {
          alert(err.response.data.message || "无法开始聊天。请稍后再试。");
        }
      } else {
        alert("网络错误。请检查您的连接并重试。");
      }
    }
  };

  return (
    <div className="sitterDetailPage">
      {/* 顶部导航 */}
      <header className="detailHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        {/* <div className="headerCenter">
          <span className="headerIcon">🚶</span>
          <span className="headerTitle">{selectedService}</span>
          <span className="headerLocation">· {sitter.location}</span>
        </div> */}
        <button className="saveButton">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          保存
        </button>
      </header>

      {/* 内容区域 */}
      <div className="detailContent">
        {/* 左侧主要内容 */}
        <div className="mainContent">
          {/* 保姆基本信息 */}
          <div className="sitterBasicInfo">
            <div className="sitterHeader">
              <img src={formattedSitter.avatar} className="sitterAvatar" />
              <div>
                <h1 className="sitterName">{formattedSitter.name}</h1>
                <p className="sitterTagline">{formattedSitter.tagline} • {formattedSitter.locationDetail}</p>
                <div className="sitterMeta">
                  <span className="metaItem">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    宠物帮 保姆自 {formattedSitter.joinDate}
                  </span>
                  <span className="metaItem">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {formattedSitter.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* 活跃状态 */}
            <div className="activeStatus">
              <svg className="clockIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="statusTitle">在宠物帮社区活跃</div>
                {formattedSitter.calendarUpdated && (
                  <div className="calendarUpdate">
                    <svg className="checkIcon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    最近更新日历
                  </div>
                )}
                <div className="lastActive">最后活跃</div>
                <div className="activeTime">{formattedSitter.lastActive}</div>
                <div className="responseTime">通常回复</div>
              </div>
            </div>
          </div>

          {/* 关于保姆 */}
          <section className="aboutSection">
            <h2 className="sectionTitle">关于 {formattedSitter.name}</h2>
            <p className="aboutText">{formattedSitter.about}</p>
            {formattedSitter.certifications && formattedSitter.certifications.length > 0 && (
              <div className="certifications">
                <h3>资质认证：</h3>
                <ul>
                  {formattedSitter.certifications.map((cert, index) => (
                    <li key={index}>✓ {cert}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* <button className="readMoreButton">阅读更多 →</button> */}
          </section>

          {/* 提供的服务 */}
          <section className="servicesSection">
            <h2 className="sectionTitle">{formattedSitter.name} 提供...</h2>
            
            <div className="servicesGrid">
              {/* <div className="serviceCategory">
                <h3 className="categoryTitle">在 {formattedSitter.name} 的家</h3>
                <div className="serviceItem disabled">
                  <div className="serviceIcon">🏠</div>
                  <div className="serviceContent">
                    <div className="serviceName">{formattedSitter.name} 目前在他们家不提供任何服务</div>
                  </div>
                </div>
              </div> */}

              <div className="serviceCategory">
                {/* <h3 className="categoryTitle">在您的家</h3> */}
                {formattedSitter.services.length > 0 ? (
                  formattedSitter.services.map(service => (
                    <div key={service.id} className="serviceItem">
                      <div className="serviceIcon">{service.icon}</div>
                      <div className="serviceContent">
                        <div className="serviceName">{service.name}</div>
                        <div className="serviceDescription">{service.description}</div>
                        <div className="servicePrice">
                          起价 ¥{service.price} /次
                          {service.pricePerExtra && `, 每增加一只宠物¥${service.pricePerExtra}`}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="serviceItem disabled">
                    <div className="serviceContent">
                      <div className="serviceName">暂无可用服务</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 可用性 */}
          <section className="availabilitySection">
            <div className="sectionHeader">
              <h2 className="sectionTitle">可用性</h2>
              <div className="calendarUpdate">
                <svg className="checkIcon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                最近更新日历
              </div>
            </div>

            <div className="serviceSelector">
              <label className="serviceLabel">
                <span className="serviceIcon">🚶</span>
                {selectedService}
              </label>
            </div>

            <div className="calendar">
              <div className="calendarHeader">
                <button 
                  className="monthNav"
                  onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
                  disabled={selectedMonth === 0}
                >
                  ←
                </button>
                <div className="monthSelector">
                  <button 
                    className={`monthButton ${selectedMonth === 0 ? 'active' : ''}`}
                    onClick={() => setSelectedMonth(0)}
                  >
                    {months[0].name}
                  </button>
                  <button 
                    className={`monthButton ${selectedMonth === 1 ? 'active' : ''}`}
                    onClick={() => setSelectedMonth(1)}
                  >
                    {months[1].name}
                  </button>
                </div>
                <button 
                  className="monthNav"
                  onClick={() => setSelectedMonth(Math.min(1, selectedMonth + 1))}
                  disabled={selectedMonth === 1}
                >
                  →
                </button>
              </div>

              <div className="calendarGrid">
                <div className="weekDays">
                  {weekDays.map(day => (
                    <div key={day} className="weekDay">{day}</div>
                  ))}
                </div>
                <div className="monthDays">
                  {calendarDays.map((day, index) => (
                    <div key={index} className={`calendarDay ${day ? '' : 'empty'}`}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <button className="goToTodayButton">前往今天</button>
            </div>
          </section>

          {/* 保姆住所 */}
          <section className="homeSection">
            <h2 className="sectionTitle">关于 {formattedSitter.name} 的家</h2>
            
            <div className="mapContainer">
              <Map 
                items={[{
                  id: formattedSitter.id,
                  latitude: formattedSitter.aboutHome.lat,
                  longitude: formattedSitter.aboutHome.lng,
                  title: formattedSitter.name,
                  images: formattedSitter.images,
                  price: currentService.price,
                  linkPath: `/sitters/${formattedSitter.id}`,
                }]} 
                city={formattedSitter.location}
              />
            </div>

            <div className="homeDetails">
              <div className="homeDetail">
                <svg className="homeIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{formattedSitter.aboutHome.type}</span>
              </div>
              <div className="homeDetail">
                <svg className="homeIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span>{formattedSitter.aboutHome.outdoorArea}</span>
              </div>
            </div>
          </section>

          {/* 评价区域 */}
          {formattedSitter.reviewsList && formattedSitter.reviewsList.length > 0 && (
            <section className="reviewsSection">
              <h2 className="sectionTitle">
                评价 ({formattedSitter.reviewsList.length})
              </h2>
              <div className="reviewsList">
                {formattedSitter.reviewsList.map((review) => (
                  <div key={review.id} className="reviewItem">
                    <div className="reviewHeader">
                      <div className="reviewerInfo">
                        <img
                          src={review.user?.avatar || "/noavatar.jpg"}
                          alt={review.user?.username || "用户"}
                        />
                        <div>
                          <div className="reviewerName">
                            {review.user?.username || "匿名用户"}
                          </div>
                          <div className="reviewDate">
                            {new Date(review.createdAt).toLocaleDateString("zh-CN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="reviewRating">
                        {"⭐".repeat(Math.floor(review.rating))}
                        {review.rating % 1 >= 0.5 && "⭐"}
                        <span className="ratingValue">{review.rating}</span>
                      </div>
                    </div>
                    {review.isOrderReview && review.orderInfo && (
                      <div className="orderInfo">
                        <span className="orderBadge">订单评价</span>
                        <span className="orderDetails">
                          订单号：{review.orderInfo.orderNumber} · {review.orderInfo.serviceType}
                        </span>
                      </div>
                    )}
                    {review.comment && (
                      <p className="reviewComment">{review.comment}</p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="reviewImages">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`评价图片 ${index + 1}`}
                            className="reviewImage"
                          />
                        ))}
                      </div>
                    )}
                    {review.tags && review.tags.length > 0 && (
                      <div className="reviewTags">
                        {review.tags.map((tag, index) => (
                          <span key={index} className="reviewTag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 右侧预订卡片 */}
        <aside className="bookingCard">
          <div className="bookingCardSticky">
            <div className="priceSection">
              <div className="priceHeader">
                <span className="priceIcon">🚶</span>
                <div className="priceInfo">
                  <div className="serviceName">{currentService.name}</div>
                  <div className="priceAmount">
                    起价 ¥{currentService.price} /次，每增加一只宠物¥{currentService.pricePerExtra || 0}
                  </div>
                </div>
              </div>
              <button className="changeButton">更改</button>
            </div>

            <div className="bookingOptions">
              <div className="optionRow">
                <label>宠物数量</label>
                <div className="petCounter">
                  <button 
                    className="counterButton"
                    onClick={() => setPetCount(Math.max(1, petCount - 1))}
                  >
                    -
                  </button>
                  <span className="counterValue">{petCount}</span>
                  <button 
                    className="counterButton"
                    onClick={() => setPetCount(petCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="optionRow">
                <div className="dateInfo">
                  <div className="dateLabel">未指定日期</div>
                  <div className="dateLocation">在您的家</div>
                </div>
                <button className="changeButton">更改</button>
              </div>
            </div>

            <button 
              className="bookButton" 
              onClick={() => navigate(`/sitters/${id}/book`, { 
                state: { serviceType: selectedService } 
              })}
            >
              立即下单
            </button>
            <button className="contactButton" onClick={handleContact}>联系 {formattedSitter.name}</button> 

            <div className="cancellationPolicy">
              <div className="policyHeader">
                <svg className="infoIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="policyTitle">灵活取消政策</span>
              </div>
              <p className="policyText">{formattedSitter.cancellationPolicy}</p>
            </div>

            <div className="guaranteeSection">
              <svg className="shieldIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <div className="guaranteeTitle">通过 宠物帮 预订</div>
                <p className="guaranteeText">享受 宠物帮 保障，包括免费客户支持、安全无现金支付、每日更新等</p>
                {/* <a href="#" className="guaranteeLink">阅读更多 ↗</a> */}
              </div>
            </div>

            {/* <div className="paymentMethods">
              <div className="paymentIcons">
                <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" />
                <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" />
                <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" />
                <img src="https://img.icons8.com/color/48/apple-pay.png" alt="Apple Pay" />
                <img src="https://img.icons8.com/color/48/google-pay.png" alt="Google Pay" />
              </div>
              <div className="paymentIconsSecond">
                <img src="https://img.icons8.com/color/48/wechat.png" alt="WeChat Pay" />
                <img src="https://img.icons8.com/color/48/alipay.png" alt="Alipay" />
              </div>
            </div> */}
          </div>
        </aside>
      </div>

      {/* 聊天弹窗 */}
      {showChat && (
        <div className="chatPopup">
          <div className="chatPopupHeader">
            <h3>与 {formattedSitter.name} 聊天</h3>
            <button className="closeChatButton" onClick={() => {
              setShowChat(false);
              setCurrentChat(null);
              setReceiver(null);
            }}>
              ✕
            </button>
          </div>
          <Chat initialChat={currentChat} initialReceiver={receiver} />
        </div>
      )}
    </div>
  );
}

export default SitterDetail;
