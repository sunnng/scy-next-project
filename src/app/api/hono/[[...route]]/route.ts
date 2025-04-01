import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

// 客户端信息结构
interface ClientInfo {
  id: string;
  deviceId: string;
  lastSeen: number;
  isOnline: boolean;
  foregroundApp: string;
  isForeground: boolean;
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

// 存储所有客户端信息
const clients: Record<string, ClientInfo> = {};

// 设置客户端的超时时间（毫秒）
const CLIENT_TIMEOUT = 30 * 1000; // 30秒

const app = new Hono().basePath("/api/hono");

// 客户端轮询端点
app.post("/client/poll", async (c) => {
  try {
    const body = await c.req.json();
    const clientId = body.clientId ? body.clientId : crypto.randomUUID();
    const deviceId = body.deviceId || "未知设备";
    const foregroundApp = body.foregroundApp || "未知应用";
    const isForeground = body.isForeground === true;

    // 更新或注册客户端信息
    if (!clients[clientId]) {
      clients[clientId] = {
        id: clientId,
        deviceId,
        lastSeen: Date.now(),
        isOnline: true,
        foregroundApp,
        isForeground,
        pendingCommands: [],
      };
    } else {
      const client = clients[clientId];
      if (client) {
        client.lastSeen = Date.now();
        client.isOnline = true;
        client.deviceId = deviceId;
        client.foregroundApp = foregroundApp;
        client.isForeground = isForeground;
      }
    }

    // 获取客户端的待执行命令
    const pendingCommands =
      clients[clientId]?.pendingCommands.filter((cmd) => !cmd.executed) || [];

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

    const client = clients[clientId];
    if (client && Array.isArray(client.pendingCommands)) {
      const commandIndex = client.pendingCommands.findIndex(
        (cmd) => cmd.id === commandId
      );
      if (commandIndex !== -1) {
        const command = client.pendingCommands[commandIndex];
        if (command) {
          command.executed = true;
        }
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
    deviceId: client.deviceId,
    isOnline: client.isOnline,
    lastSeen: client.lastSeen,
    foregroundApp: client.foregroundApp,
    isForeground: client.isForeground,
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

    const client = clients[clientId];
    if (!client) {
      return c.json({ error: "客户端不存在" }, 404);
    }

    const command: Command = {
      id: crypto.randomUUID(),
      type: commandType,
      payload: commandPayload || {},
      timestamp: Date.now(),
      executed: false,
    };

    client.pendingCommands.push(command);

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
      const client = clients[clientId];
      if (client && now - client.lastSeen > CLIENT_TIMEOUT) {
        client.isOnline = false;
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
      const client = clients[clientId];
      if (client && now - client.lastSeen > oneDay) {
        delete clients[clientId];
      }
    }
  }
}, 60 * 60 * 1000);

export const GET = handle(app);
export const POST = handle(app);
