import Link from "next/link";

export default function Home() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-center font-bold text-2xl">设备监控与指令管理系统</h1>

			<div className="mx-auto max-w-3xl">
				<div className="mb-6 rounded-lg bg-white p-6 shadow-md">
					<h2 className="mb-4 font-semibold text-xl">系统概述</h2>
					<p className="mb-4">
						本系统用于监控客户端的在线状态，并可以向客户端发送指令。客户端通过短轮询方式与服务端建立连接，
						每次连接时会上报设备ID、前台应用、前台状态等信息。
					</p>
					<div className="mt-6 flex justify-center">
						<Link
							href="/admin"
							className="rounded-md bg-blue-500 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-600"
						>
							进入管理页面
						</Link>
					</div>
				</div>

				<div className="mb-6 rounded-lg bg-white p-6 shadow-md">
					<h2 className="mb-4 font-semibold text-xl">系统功能</h2>
					<ul className="ml-6 list-disc space-y-2">
						<li>查看所有设备的在线状态</li>
						<li>监控设备前台应用变化</li>
						<li>监控应用前台/后台状态</li>
						<li>向设备发送指令</li>
						<li>
							支持多种指令类型：
							<ul className="mt-1 ml-6 list-circle space-y-1">
								<li>重启设备</li>
								<li>更新固件</li>
								<li>切换前台/后台状态</li>
								<li>切换应用</li>
								<li>自定义指令</li>
							</ul>
						</li>
					</ul>
				</div>

				<div className="rounded-lg bg-white p-6 shadow-md">
					<h2 className="mb-4 font-semibold text-xl">客户端集成</h2>
					<p className="mb-4">客户端通过HTTP协议短轮询与服务端通信，需实现以下两个接口：</p>
					<div className="mb-4 rounded-md bg-gray-50 p-4">
						<h3 className="mb-2 font-medium">1. 轮询接口</h3>
						<div className="mb-2 rounded bg-gray-100 p-2 font-mono text-sm">POST /api/hono/client/poll</div>
						<p className="mb-2 text-gray-600 text-sm">请求参数：</p>
						<pre className="overflow-auto rounded-md bg-gray-800 p-3 text-gray-100 text-xs">
							{`{
  "clientId": "可选，首次连接不需要",
  "deviceId": "设备ID",
  "foregroundApp": "前台应用名称",
  "isForeground": true/false
}`}
						</pre>
					</div>
					<div className="rounded-md bg-gray-50 p-4">
						<h3 className="mb-2 font-medium">2. 命令确认接口</h3>
						<div className="mb-2 rounded bg-gray-100 p-2 font-mono text-sm">POST /api/hono/client/ack</div>
						<p className="mb-2 text-gray-600 text-sm">请求参数：</p>
						<pre className="overflow-auto rounded-md bg-gray-800 p-3 text-gray-100 text-xs">
							{`{
  "clientId": "客户端ID",
  "commandId": "已执行的命令ID"
}`}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
