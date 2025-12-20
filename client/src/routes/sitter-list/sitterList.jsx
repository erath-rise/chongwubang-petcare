import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./sitterList.scss";

function SitterList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 筛选状态
  const [filters, setFilters] = useState({
    serviceType: searchParams.get("type") || "遛狗",
    location: searchParams.get("city") || "北京市",
    date: "",
    priceMin: 4,
    priceMax: 180
  });

  const [sortBy, setSortBy] = useState("推荐");
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取护理员数据
  useEffect(() => {
    const fetchSitters = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        
        // 添加筛选参数
        if (filters.location) params.append("city", filters.location);
        if (filters.serviceType) params.append("serviceType", filters.serviceType);
        if (filters.priceMin) params.append("minPrice", filters.priceMin);
        if (filters.priceMax) params.append("maxPrice", filters.priceMax);
        if (sortBy) params.append("sortBy", sortBy);
        
        const res = await apiRequest.get(`/sitters?${params}`);
        setSitters(res.data);
      } catch (err) {
        console.error("获取护理员列表失败:", err);
        setError("加载护理员列表失败，请稍后重试");
        // 如果API失败，使用模拟数据
        setSitters([
          {
            id: "1",
            name: "李明",
            avatar: "https://i.pravatar.cc/150?img=12",
            isNew: true,
            description: "爱宠物的铲屎官，家有3只猫 • 细心、耐心、经验丰富",
            basePrice: 50,
            lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            rating: 4.9,
            reviewCount: 24,
            city: "北京市",
            latitude: "39.9042",
            longitude: "116.4074"
          },
          {
            id: "2",
            name: "王芳",
            avatar: "https://i.pravatar.cc/150?img=45",
            isNew: true,
            description: "值得信赖的宠物保姆和遛狗员",
            basePrice: 45,
            lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            rating: 5.0,
            reviewCount: 18,
            city: "北京市",
            latitude: "39.9042",
            longitude: "116.4074"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSitters();
  }, [filters.location, filters.serviceType, filters.priceMin, filters.priceMax, sortBy]);

  // 计算距离（模拟函数）
  const calculateDistance = (lat, lng) => {
    // 这里应该使用实际的地理位置计算
    // 暂时返回随机距离
    const distance = (Math.random() * 3 + 0.5).toFixed(1);
    return `${distance} 公里`;
  };

  // 格式化最后活跃时间
  const formatLastActive = (lastActive) => {
    const now = new Date();
    const activeDate = new Date(lastActive);
    const diffTime = Math.abs(now - activeDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "今天活跃";
    if (diffDays === 1) return "1天前活跃";
    if (diffDays < 7) return `${diffDays}天前活跃`;
    return `${Math.floor(diffDays / 7)}周前活跃`;
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setFilters({ ...filters, [type]: value });
  };

  return (
    <div className="sitterListPage">
      {/* 顶部筛选区 */}
      <div className="filterTopBar">
        <div className="filterContainer">
          <div className="filterSection">
            <label className="filterLabel">服务类型</label>
            <select 
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="filterSelect"
            >
              <option value="遛狗">🚶 遛狗</option>
              <option value="宠物寄养">🏠 宠物寄养</option>
              <option value="上门照看">🏡 上门照看</option>
              <option value="日间照看">☀️ 日间照看</option>
            </select>
          </div>

          <div className="filterSection">
            <label className="filterLabel">地点</label>
            <input 
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filterInput"
              placeholder="输入城市或地区"
            />
          </div>

          <div className="filterSection">
            <label className="filterLabel">日期</label>
            <input 
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="filterInput"
              placeholder="选择日期"
            />
          </div>

          <div className="filterSection priceSection">
            <label className="filterLabel">价格范围 (¥)</label>
            <div className="priceInputs">
              <input 
                type="number"
                value={filters.priceMin}
                onChange={(e) => handlePriceChange(e, 'priceMin')}
                className="priceInput"
                placeholder="最低"
              />
              <span className="priceSeparator">-</span>
              <input 
                type="number"
                value={filters.priceMax}
                onChange={(e) => handlePriceChange(e, 'priceMax')}
                className="priceInput"
                placeholder="最高"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="contentWrapper">
        {/* 列表区 */}
        <main className="sitterListContainer">
        {/* 顶部保障信息 */}
        <div className="guaranteeBanner">
          <svg className="infoIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>所有预订均受 <a href="#" className="guaranteeLink">平台保障计划</a> 保护</span>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="errorBanner">
            <svg className="errorIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* 排序选项 */}
        <div className="sortSection">
          <label>排序方式: </label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sortSelect"
          >
            <option value="推荐">推荐</option>
            <option value="价格从低到高">价格：从低到高</option>
            <option value="价格从高到低">价格：从高到低</option>
            <option value="距离">距离</option>
            <option value="评分">评分</option>
          </select>
        </div>

        {/* 加载状态 */}
        {loading ? (
          <div className="loadingContainer">
            <div className="spinner"></div>
            <p>正在加载护理员列表...</p>
          </div>
        ) : sitters.length === 0 ? (
          <div className="emptyContainer">
            <svg className="emptyIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>暂无符合条件的护理员</p>
            <p className="emptyHint">试试调整筛选条件</p>
          </div>
        ) : (
          <>
            {/* 护理员列表 */}
            <div className="sittersList">
              {sitters.map((sitter, index) => (
                <div 
                  key={sitter.id} 
                  className="sitterCard"
                  onClick={() => navigate(`/sitters/${sitter.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="sitterCardContent">
                    <img 
                      src={sitter.avatar || sitter.user?.avatar || 'https://via.placeholder.com/120'} 
                      alt={sitter.name} 
                      className="sitterAvatar"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120x120/4F46E5/ffffff?text=' + sitter.name.charAt(0);
                      }}
                    />
                    
                    <div className="sitterInfo">
                      <div className="sitterHeader">
                        <h3 className="sitterName">
                          {index + 1}. {sitter.name}
                          {sitter.isNew && <span className="newBadge">新护理员</span>}
                        </h3>
                      </div>
                      
                      <p className="sitterDescription">{sitter.description}</p>
                      <p className="sitterDistance">
                        {calculateDistance(sitter.latitude, sitter.longitude)}
                      </p>
                      
                      <div className="sitterStatus">
                        {sitter.availability && sitter.availability.length > 0 && (
                          <span className="statusItem calendarStatus">
                            <svg className="statusIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            日历已更新
                          </span>
                        )}
                        <span className="statusItem">
                          <svg className="statusIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatLastActive(sitter.lastActive)}
                        </span>
                      </div>
                    </div>

                    <div className="sitterPrice">
                      <div className="priceInfo">
                        <span className="priceLabel">起价</span>
                        <span className="priceAmount">¥{sitter.basePrice || sitter.price}</span>
                        <span className="priceUnit">/次</span>
                      </div>
                      {sitter.rating > 0 && (
                        <div className="ratingInfo">
                          <span className="ratingStar">⭐</span>
                          <span className="ratingValue">{sitter.rating.toFixed(1)}</span>
                          <span className="reviewCount">({sitter.reviewCount || sitter._count?.reviews || 0})</span>
                        </div>
                      )}
                    </div>

                    <button 
                      className="favoriteButton"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="heartIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

        {/* 右侧地图区 */}
        <aside className="mapSidebar">
          <div className="mapContainer">
            <div className="mapPlaceholder">
              <p className="mapText">地图视图</p>
              <p className="mapSubtext">显示护理员位置</p>
              {/* 这里可以集成真实的地图组件 */}
              <div className="mapMarkers">
                {sitters.map((sitter, index) => (
                  <div 
                    key={sitter.id} 
                    className="mapMarker"
                    style={{
                      top: `${30 + index * 20}%`,
                      left: `${40 + index * 15}%`
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SitterList;

