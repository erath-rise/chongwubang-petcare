# Pet Care Hub - API 文档

## 护理员 (Sitter) API

### 1. 获取护理员列表（搜索接口）
```
GET /api/sitters
```

**查询参数：**
- `city` - 城市筛选（例如：北京市、上海市）
- `serviceType` - 服务类型（遛狗、宠物寄养、上门照看、日间照看）
- `date` - 日期筛选，只返回在指定日期可用的护理员（格式：YYYY-MM-DD）
- `minPrice` - 最低价格
- `maxPrice` - 最高价格
- `sortBy` - 排序方式（推荐、价格从低到高、价格从高到低、评分、距离）

**示例请求：**
```
GET /api/sitters?city=北京市&serviceType=遛狗&date=2024-01-15&minPrice=30&maxPrice=100&sortBy=推荐
```

**响应示例：**
```json
[
  {
    "id": "xxx",
    "name": "李明",
    "avatar": "https://...",
    "description": "爱宠物的铲屎官...",
    "isNew": true,
    "rating": 4.9,
    "reviewCount": 24,
    "basePrice": 50,
    "city": "北京市",
    "address": "朝阳区...",
    "latitude": "39.9042",
    "longitude": "116.4074",
    "services": [...],
    "user": {...}
  }
]
```

### 2. 获取护理员详情
```
GET /api/sitters/:id
```

**响应包含：**
- 护理员基本信息
- 提供的服务列表
- 评价列表
- 可用时间
- 用户信息

### 3. 创建护理员（需要登录）
```
POST /api/sitters
```

**请求体：**
```json
{
  "name": "李明",
  "avatar": "https://...",
  "description": "爱宠物的铲屎官...",
  "basePrice": 50,
  "city": "北京市",
  "address": "朝阳区...",
  "latitude": "39.9042",
  "longitude": "116.4074",
  "certifications": ["宠物护理师证书"],
  "experience": "3年宠物护理经验"
}
```

### 4. 更新护理员信息（需要登录）
```
PUT /api/sitters/:id
```

### 5. 删除护理员（需要登录）
```
DELETE /api/sitters/:id
```

---

## 护理员服务 (Sitter Service) API

### 1. 添加服务（需要登录）
```
POST /api/sitters/:id/services
```

**请求体：**
```json
{
  "serviceType": "遛狗",
  "price": 50,
  "description": "每次30分钟遛狗服务",
  "duration": 30
}
```

### 2. 更新服务（需要登录）
```
PUT /api/sitters/:id/services/:serviceId
```

### 3. 删除服务（需要登录）
```
DELETE /api/sitters/:id/services/:serviceId
```

---

## 护理员评价 (Review) API

### 1. 获取评价列表
```
GET /api/sitters/:id/reviews
```

**响应示例：**
```json
[
  {
    "id": "xxx",
    "rating": 5,
    "comment": "非常专业，我的狗狗很喜欢！",
    "images": ["https://..."],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "xxx",
      "username": "张三",
      "avatar": "https://..."
    }
  }
]
```

### 2. 添加评价（需要登录）
```
POST /api/sitters/:id/reviews
```

**请求体：**
```json
{
  "rating": 5,
  "comment": "非常专业！",
  "images": ["https://..."]
}
```

---

## 护理员可用时间 (Availability) API

### 1. 获取可用时间
```
GET /api/sitters/:id/availability?startDate=2024-01-01&endDate=2024-01-31
```

### 2. 更新可用时间（需要登录）
```
POST /api/sitters/:id/availability
```

**请求体：**
```json
{
  "availabilities": [
    {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "12:00",
      "isAvailable": true
    },
    {
      "date": "2024-01-15",
      "startTime": "14:00",
      "endTime": "18:00",
      "isAvailable": true
    }
  ]
}
```

---

## 预订 (Booking) API

### 1. 创建预订（需要登录）
```
POST /api/bookings
```

**请求体：**
```json
{
  "sitterId": "xxx",
  "serviceType": "遛狗",
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "price": 50,
  "petInfo": "金毛，3岁，性格温顺",
  "specialNeeds": "需要避开其他狗狗"
}
```

### 2. 获取单个预订详情（需要登录）
```
GET /api/bookings/:id
```

### 3. 更新预订状态（需要登录）
```
PUT /api/bookings/:id
```

**请求体：**
```json
{
  "status": "confirmed" // pending, confirmed, completed, cancelled
}
```

### 4. 取消预订（需要登录）
```
DELETE /api/bookings/:id
```

### 5. 获取护理员的预订列表（需要登录，仅护理员本人）
```
GET /api/bookings/sitter/:sitterId
```

### 6. 获取用户的预订列表（需要登录）
```
GET /api/bookings/user/my-bookings
```

**响应示例：**
```json
[
  {
    "id": "xxx",
    "serviceType": "遛狗",
    "date": "2024-01-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "price": 50,
    "status": "confirmed",
    "petInfo": "金毛，3岁",
    "specialNeeds": "需要避开其他狗狗",
    "lastContacted": "2024-01-10T00:00:00.000Z",
    "sitter": {
      "id": "xxx",
      "name": "李明",
      "avatar": "https://...",
      "user": {...},
      "services": [...]
    },
    "user": {
      "id": "xxx",
      "username": "张三",
      "avatar": "https://..."
    }
  }
]
```

---

## 认证说明

需要登录的API需要在请求头中包含认证token（通过Cookie自动发送）。

登录后，token会自动保存在Cookie中，无需手动处理。

---

## 错误响应

所有API在发生错误时会返回以下格式：

```json
{
  "message": "错误描述信息"
}
```

常见HTTP状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源未找到
- `500` - 服务器错误

---

## 使用示例

### 前端调用示例（使用axios）

```javascript
import apiRequest from './lib/apiRequest';

// 获取护理员列表
const getSitters = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.location) params.append('city', filters.location);
  if (filters.serviceType) params.append('serviceType', filters.serviceType);
  if (filters.date) params.append('date', filters.date);
  if (filters.priceMin) params.append('minPrice', filters.priceMin);
  if (filters.priceMax) params.append('maxPrice', filters.priceMax);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  
  const res = await apiRequest.get(`/sitters?${params}`);
  return res.data;
};

// 创建预订
const createBooking = async (bookingData) => {
  const res = await apiRequest.post('/bookings', bookingData);
  return res.data;
};

// 添加评价
const addReview = async (sitterId, reviewData) => {
  const res = await apiRequest.post(`/sitters/${sitterId}/reviews`, reviewData);
  return res.data;
};
```
