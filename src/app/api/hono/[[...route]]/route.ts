import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

// 存储消息的数据结构
interface Message {
  id: string;
  content: string;
  timestamp: number;
}

// 客户端信息结构
interface ClientInfo {
  id: string;
  lastSeen: number;
  isOnline: boolean;
  deviceInfo: string;
  pendingCommands: Command[];
}

// 命令结构
interface Command {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  executed: boolean;
}

// 存储所有消息
const messages: Message[] = [];

// 存储所有客户端信息
const clients: Record<string, ClientInfo> = {};

// 设置客户端的超时时间（毫秒）
const CLIENT_TIMEOUT = 30 * 1000; // 30秒

const app = new Hono().basePath("/api/hono");

app.get("/hello", (c) => {
  return c.json({
    message: "Hello Next.js!",
  });
});

// 客户端轮询端点
app.post("/client/poll", async (c) => {
  try {
    const body = await c.req.json();
    const clientId = body.clientId || crypto.randomUUID();
    const deviceInfo = body.deviceInfo || "未知设备";

    // 更新或注册客户端信息
    if (!clients[clientId]) {
      clients[clientId] = {
        id: clientId,
        lastSeen: Date.now(),
        isOnline: true,
        deviceInfo,
        pendingCommands: [],
      };
    } else {
      clients[clientId].lastSeen = Date.now();
      clients[clientId].isOnline = true;
      if (deviceInfo !== "未知设备") {
        clients[clientId].deviceInfo = deviceInfo;
      }
    }

    // 获取客户端的待执行命令
    const pendingCommands = clients[clientId].pendingCommands.filter(
      (cmd) => !cmd.executed
    );

    return c.json({
      clientId,
      status: "connected",
      timestamp: Date.now(),
      commands: pendingCommands,
    });
  } catch (error) {
    return c.json({ error: "处理请求时出错" }, 500);
  }
});

// 客户端确认命令执行完成
app.post("/client/ack", async (c) => {
  try {
    const body = await c.req.json();
    const { clientId, commandId } = body;

    if (!clientId || !commandId) {
      return c.json({ error: "缺少客户端ID或命令ID" }, 400);
    }

    if (clients[clientId]) {
      const commandIndex = clients[clientId].pendingCommands.findIndex(
        (cmd) => cmd.id === commandId
      );
      if (commandIndex !== -1) {
        clients[clientId].pendingCommands[commandIndex].executed = true;
      }
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "处理请求时出错" }, 500);
  }
});

// 管理端获取所有客户端状态
app.get("/admin/clients", (c) => {
  // 更新客户端在线状态
  updateClientsStatus();

  // 格式化客户端信息以便输出
  const clientsInfo = Object.values(clients).map((client) => ({
    id: client.id,
    isOnline: client.isOnline,
    lastSeen: client.lastSeen,
    deviceInfo: client.deviceInfo,
    pendingCommandsCount: client.pendingCommands.filter((cmd) => !cmd.executed)
      .length,
  }));

  return c.json({ clients: clientsInfo });
});

// 管理端向指定客户端发送命令
app.post("/admin/send-command", async (c) => {
  try {
    const body = await c.req.json();
    const { clientId, commandType, commandPayload } = body;

    if (!clientId || !commandType) {
      return c.json({ error: "缺少客户端ID或命令类型" }, 400);
    }

    if (!clients[clientId]) {
      return c.json({ error: "客户端不存在" }, 404);
    }

    const command: Command = {
      id: crypto.randomUUID(),
      type: commandType,
      payload: commandPayload || {},
      timestamp: Date.now(),
      executed: false,
    };

    clients[clientId].pendingCommands.push(command);

    return c.json({ success: true, command });
  } catch (error) {
    return c.json({ error: "处理请求时出错" }, 500);
  }
});

// 更新客户端在线状态的函数
function updateClientsStatus() {
  const now = Date.now();

  for (const clientId in clients) {
    if (Object.prototype.hasOwnProperty.call(clients, clientId)) {
      if (now - clients[clientId].lastSeen > CLIENT_TIMEOUT) {
        clients[clientId].isOnline = false;
      }
    }
  }
}

// 周期性清理长时间离线的客户端（每小时执行一次）
setInterval(() => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数

  for (const clientId in clients) {
    if (Object.prototype.hasOwnProperty.call(clients, clientId)) {
      if (now - clients[clientId].lastSeen > oneDay) {
        delete clients[clientId];
      }
    }
  }
}, 60 * 60 * 1000);

// 以下保留原有的消息相关端点
// 发送消息的端点
app.post("/messages", async (c) => {
  const body = await c.req.json();

  if (!body.content || typeof body.content !== "string") {
    return c.json({ error: "Content is required and must be a string" }, 400);
  }

  const message: Message = {
    id: crypto.randomUUID(),
    content: body.content,
    timestamp: Date.now(),
  };

  messages.push(message);

  // 只保留最新的100条消息
  if (messages.length > 100) {
    messages.shift();
  }

  return c.json({ success: true, message });
});

// 客户端轮询获取新消息的端点
app.get("/messages", (c) => {
  const clientId = c.req.query("clientId") || crypto.randomUUID();
  const lastTimestamp = Number.parseInt(
    c.req.query("lastTimestamp") || "0",
    10
  );

  // 确保客户端存在
  if (!clients[clientId]) {
    clients[clientId] = {
      id: clientId,
      lastSeen: Date.now(),
      isOnline: true,
      deviceInfo: "消息系统客户端",
      pendingCommands: [],
    };
  } else {
    clients[clientId].lastSeen = Date.now();
  }

  // 只返回上次轮询之后的新消息
  const newMessages = messages.filter((msg) => msg.timestamp > lastTimestamp);

  // 计算最新的时间戳
  let newLastTimestamp = lastTimestamp;
  if (newMessages.length > 0) {
    newLastTimestamp = newMessages.reduce(
      (max, msg) => (msg.timestamp > max ? msg.timestamp : max),
      lastTimestamp
    );
  }

  return c.json({
    clientId,
    messages: newMessages,
    lastTimestamp: newLastTimestamp,
  });
});

export const GET = handle(app);
export const POST = handle(app);
