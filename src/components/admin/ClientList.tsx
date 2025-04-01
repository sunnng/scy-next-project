"use client";

import { useState } from "react";

interface ClientInfo {
	id: string;
	isOnline: boolean;
	lastSeen: number;
	deviceInfo: string;
	pendingCommandsCount: number;
}

interface ClientListProps {
	clients: ClientInfo[];
	loading: boolean;
	selectedClientId: string | null;
	onSelectClient: (clientId: string) => void;
}

export default function ClientList({ clients, loading, selectedClientId, onSelectClient }: ClientListProps) {
	const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

	// 过滤客户端列表
	const filteredClients = clients.filter((client) => {
		if (filter === "online") return client.isOnline;
		if (filter === "offline") return !client.isOnline;
		return true;
	});

	// 格式化最后一次活动时间
	const formatLastSeen = (timestamp: number) => {
		const lastSeen = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - lastSeen.getTime();
		const diffSec = Math.floor(diffMs / 1000);

		if (diffSec < 60) {
			return `${diffSec}秒前`;
		}
		if (diffSec < 3600) {
			return `${Math.floor(diffSec / 60)}分钟前`;
		}
		if (diffSec < 86400) {
			return `${Math.floor(diffSec / 3600)}小时前`;
		}
		return lastSeen.toLocaleString();
	};

	return (
		<div>
			{/* 过滤选项 */}
			<div className="mb-4 flex space-x-2">
				<button
					onClick={() => setFilter("all")}
					className={`rounded px-3 py-1 text-sm ${
						filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					全部
				</button>
				<button
					onClick={() => setFilter("online")}
					className={`rounded px-3 py-1 text-sm ${
						filter === "online" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					在线
				</button>
				<button
					onClick={() => setFilter("offline")}
					className={`rounded px-3 py-1 text-sm ${
						filter === "offline" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
				>
					离线
				</button>
			</div>

			{/* 客户端列表 */}
			{loading ? (
				<div className="flex justify-center py-8">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
					<span className="ml-2">加载中...</span>
				</div>
			) : filteredClients.length > 0 ? (
				<ul className="max-h-[400px] space-y-2 overflow-y-auto">
					{filteredClients.map((client) => (
						<li
							key={client.id}
							onClick={() => onSelectClient(client.id)}
							className={`cursor-pointer rounded-md border p-3 ${
								selectedClientId === client.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className={`h-3 w-3 rounded-full ${client.isOnline ? "bg-green-500" : "bg-red-500"}`} />
									<span className="ml-2 font-medium">{client.deviceInfo}</span>
								</div>
								{client.pendingCommandsCount > 0 && (
									<span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
										{client.pendingCommandsCount}个待执行命令
									</span>
								)}
							</div>
							<div className="mt-1 text-gray-500 text-xs">
								<div>ID: {client.id.substring(0, 8)}...</div>
								<div>最后活动: {formatLastSeen(client.lastSeen)}</div>
							</div>
						</li>
					))}
				</ul>
			) : (
				<div className="py-8 text-center text-gray-500">
					{filter === "all" ? "暂无客户端连接" : filter === "online" ? "暂无在线客户端" : "暂无离线客户端"}
				</div>
			)}
		</div>
	);
}
