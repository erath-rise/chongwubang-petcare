# 宠物帮

宠物帮是一个宠物照护平台，旨在连接宠物主人与可靠的宠物照护者。

## 技术栈

- **后端**: Node.js + Express.js 框架，Prisma ORM，MongoDB 数据库，JWT 身份验证
- **前端**: React UI 开发，Vite 构建工具，Axios 用于 API 调用，Socket.io 实时通信
- **其他工具**: Git 版本控制，Render 用于后端部署，Vercel 用于前端部署

## 在线网站地址

https://pet-care-hub.vercel.app/

## 功能特性

- **个人资料管理** - 用户可以创建和管理个人资料
- **照护需求发布与浏览** - 宠物主人可以发布照护需求，照护者可以浏览和申请
- **提醒功能** - 重要事项提醒
- **站内消息系统** - 用户之间可以实时聊天交流
- **用户身份验证** - 安全的注册和登录系统

## 安装步骤

1. 克隆仓库：
    ```bash
    git clone https://github.com/erath-rise/chongwubang-petcare.git
    ```

2. 进入项目目录：
   ```bash
   cd chongwubang-petcare
   ```

3. 安装后端依赖：
    ```bash
    cd api
    npm install
    ```

4. 安装前端依赖：
    ```bash
    cd ../client
    npm install
    ```

5. 配置数据库：
    ```bash
    cd ../api
    npx prisma generate
    npx prisma db push
    ```

## 使用方法

1. 启动后端服务器：
     ```bash
     cd api
     node app.js
     ```
     或者使用 npm：
     ```bash
     npm start
     ```

2. 启动前端开发服务器：
     ```bash
     cd client
     npm run dev
     ```

3. 在浏览器中访问 `http://localhost:5173`（或 Vite 显示的端口）

## 项目结构

```
chongwubang-petcare/
├── api/              # 后端 API 服务
│   ├── controllers/  # 控制器
│   ├── routes/       # 路由定义
│   ├── middleware/   # 中间件
│   ├── prisma/       # Prisma 数据库配置
│   └── app.js        # 应用入口
├── client/           # 前端 React 应用
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── routes/      # 页面路由
│   │   └── context/     # React Context
│   └── public/          # 静态资源
└── README.md         # 项目说明文档

```

## 开发说明

- 后端默认运行在 `http://localhost:8800`
- 前端开发服务器默认运行在 `http://localhost:5173`
- 确保 MongoDB 数据库已正确配置并运行
- 使用 Prisma 进行数据库迁移和种子数据填充
