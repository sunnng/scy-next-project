/**
 * 非浏览器客户端示例
 *
 * 这是一个简单的Node.js客户端示例，演示如何使用短轮询方式与服务器通信
 *
 * 使用方法：
 * 1. 确保服务器已经运行
 * 2. 运行 node client.js
 * 3. 在管理界面上可以看到此客户端并向其发送命令
 */

// 对于Node.js 18+，可以直接使用内置的fetch API
// 对于较旧版本，需要安装: npm install node-fetch@2
// const fetch = require("node-fetch");

// 服务器配置
const SERVER_URL = "http://localhost:3000/api/hono";
const POLL_INTERVAL = 5000; // 轮询间隔(毫秒)

// 客户端信息
let clientId = null;

// 模拟设备信息
const os = require("os");
const deviceInfo = {
  deviceId: `node-${os.hostname().replace(/[^a-zA-Z0-9]/g, "-")}`,
  foregroundApp: "NodeJS",
  isForeground: true, // 模拟前台运行状态
};

// 命令处理器
const commandHandlers = {
  // 重启命令
  restart: async (payload) => {
    console.log("[执行命令] 重启系统 参数:", payload);
    console.log("模拟重启中...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("系统已重启");
    return true;
  },

  // 更新固件
  update: async (payload) => {
    console.log("[执行命令] 更新固件 参数:", payload);
    console.log("模拟固件更新中...");

    // 模拟更新进度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log(`更新进度: ${i}%`);
    }

    console.log("固件更新完成");
    return true;
  },

  // 切换前台/后台状态
  toggle_foreground: async (payload) => {
    console.log("[执行命令] 切换前台/后台状态 参数:", payload);
    deviceInfo.isForeground = !deviceInfo.isForeground;
    console.log(`应用现在处于${deviceInfo.isForeground ? "前台" : "后台"}`);
    return true;
  },

  // 切换应用
  switch_app: async (payload) => {
    console.log("[执行命令] 切换应用 参数:", payload);
    if (payload && payload.appName) {
      const oldApp = deviceInfo.foregroundApp;
      deviceInfo.foregroundApp = payload.appName;
      console.log(`已从 ${oldApp} 切换到 ${deviceInfo.foregroundApp}`);
    } else {
      console.log("未提供应用名称");
    }
    return true;
  },

  // 默认处理器
  default: async (type, payload) => {
    console.log("[执行命令] 未知命令类型:", type, "参数:", payload);
    return false;
  },
};

// 处理命令
async function handleCommand(command) {
  console.log(`收到命令: ${command.type} (ID: ${command.id})`);

  try {
    // 获取对应的处理器，如果没有则使用默认处理器
    const handler =
      commandHandlers[command.type] ||
      ((payload) => commandHandlers.default(command.type, payload));

    // 执行命令
    const success = await handler(command.payload);

    // 向服务器确认命令执行完成
    await acknowledgeCommand(command.id);

    return success;
  } catch (error) {
    console.error("处理命令出错:", error?.message || String(error));
    return false;
  }
}

// 向服务器确认命令执行完成
async function acknowledgeCommand(commandId) {
  try {
    const response = await fetch(`${SERVER_URL}/client/ack`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        commandId,
      }),
    });

    if (!response.ok) {
      throw new Error(`服务器返回错误状态: ${response.status}`);
    }

    console.log("已确认命令完成:", commandId);
  } catch (error) {
    console.error("确认命令出错:", error?.message || String(error));
  }
}

// 随机切换前台应用（模拟真实设备）
function simulateAppChanges() {
  const apps = ["NodeJS", "Terminal", "Browser", "FileManager", "IDE"];

  setInterval(() => {
    // 20%的概率切换应用
    if (Math.random() < 0.2) {
      const newApp = apps[Math.floor(Math.random() * apps.length)];
      if (newApp !== deviceInfo.foregroundApp) {
        deviceInfo.foregroundApp = newApp;
        console.log(`前台应用已切换到: ${newApp}`);
      }
    }

    // 10%的概率切换前台/后台状态
    if (Math.random() < 0.1) {
      deviceInfo.isForeground = !deviceInfo.isForeground;
      console.log(`应用现在处于${deviceInfo.isForeground ? "前台" : "后台"}`);
    }
  }, 10000); // 每10秒检查一次
}

// 轮询服务器
async function pollServer() {
  try {
    const response = await fetch(`${SERVER_URL}/client/poll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        deviceId: deviceInfo.deviceId,
        foregroundApp: deviceInfo.foregroundApp,
        isForeground: deviceInfo.isForeground,
      }),
    });

    if (!response.ok) {
      throw new Error(`服务器返回错误状态: ${response.status}`);
    }

    const data = await response.json();

    // 如果是首次连接，保存客户端ID
    if (!clientId) {
      clientId = data.clientId;
      console.log("已连接到服务器 客户端ID:", clientId);
    }

    // 处理所有待执行的命令
    if (data.commands && data.commands.length > 0) {
      console.log(`收到 ${data.commands.length} 个命令`);

      for (const command of data.commands) {
        await handleCommand(command);
      }
    }

    return true;
  } catch (error) {
    console.error("轮询服务器出错:", error?.message || String(error));
    return false;
  }
}

// 开始轮询
async function startPolling() {
  console.log("客户端启动中...");
  console.log("设备信息:", deviceInfo);
  console.log(`轮询间隔: ${POLL_INTERVAL}ms`);

  // 启动应用变化模拟
  simulateAppChanges();

  // 首次连接
  await pollServer();

  // 定期轮询
  setInterval(async () => {
    await pollServer();
  }, POLL_INTERVAL);
}

// 启动客户端
startPolling();

// 处理程序退出
process.on("SIGINT", () => {
  console.log("客户端正在关闭...");
  process.exit(0);
});
