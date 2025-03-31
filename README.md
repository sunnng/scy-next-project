# Hono客户端管理系统

这是一个基于Hono和Next.js构建的客户端管理系统，通过短轮询实现服务端和客户端之间的实时通信。

## 功能特点

- 服务端使用Hono框架构建API
- 客户端通过短轮询与服务端建立连接
- 管理界面可以查看所有客户端的在线状态
- 支持向指定客户端发送命令
- 提供非浏览器客户端示例

## 系统架构

- **服务端**: Hono API运行在Next.js Edge Runtime
- **管理界面**: Next.js客户端组件
- **客户端**: 支持任何能进行HTTP请求的设备/应用

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 访问管理界面

打开浏览器访问 [http://localhost:3000/admin](http://localhost:3000/admin)

### 运行测试客户端

首先安装客户端依赖:

```bash
npm install node-fetch
```

然后运行客户端:

```bash
node src/examples/client.js
```

## 客户端API

非浏览器的客户端需要实现以下API:

### 1. 轮询接口

```
POST /api/hono/client/poll
```

请求体:
```json
{
  "clientId": "可选，首次连接时不需要",
  "deviceInfo": "设备信息，如设备类型、版本等"
}
```

响应:
```json
{
  "clientId": "服务器分配的客户端ID",
  "status": "connected",
  "timestamp": 1633456789,
  "commands": [
    {
      "id": "命令ID",
      "type": "命令类型",
      "payload": {},
      "timestamp": 1633456789,
      "executed": false
    }
  ]
}
```

### 2. 命令确认接口

```
POST /api/hono/client/ack
```

请求体:
```json
{
  "clientId": "客户端ID",
  "commandId": "已执行的命令ID"
}
```

响应:
```json
{
  "success": true
}
```

## 管理API

管理界面使用以下API:

### 1. 获取客户端列表

```
GET /api/hono/admin/clients
```

### 2. 发送命令

```
POST /api/hono/admin/send-command
```

请求体:
```json
{
  "clientId": "目标客户端ID",
  "commandType": "命令类型",
  "commandPayload": {
    // 命令参数
  }
}
```

## 部署

项目可以部署到Vercel或其他支持Next.js的平台。
