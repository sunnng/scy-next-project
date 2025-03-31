"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
	id: string;
	content: string;
	timestamp: number;
}

export default function MessagePolling() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [clientId, setClientId] = useState<string | null>(null);
	const [lastTimestamp, setLastTimestamp] = useState(0);
	const [isPolling, setIsPolling] = useState(true);
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// 发送消息
	const sendMessage = async () => {
		if (!newMessage.trim()) return;

		try {
			const response = await fetch("/api/hono/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content: newMessage }),
			});

			if (response.ok) {
				setNewMessage("");
				// 立即轮询以获取新消息
				pollMessages();
			} else {
				console.error("发送消息失败");
			}
		} catch (error) {
			console.error("发送消息出错:", error);
		}
	};

	// 轮询获取新消息 - 使用useCallback记忆该函数
	const pollMessages = useCallback(async () => {
		if (!isPolling) return;

		try {
			const url = new URL("/api/hono/messages", window.location.origin);
			if (clientId) {
				url.searchParams.append("clientId", clientId);
			}
			url.searchParams.append("lastTimestamp", lastTimestamp.toString());

			const response = await fetch(url.toString());
			const data = await response.json();

			if (data.messages && data.messages.length > 0) {
				setMessages((prev) => [...prev, ...data.messages]);
			}

			// 保存客户端ID和最后的时间戳
			if (!clientId && data.clientId) {
				setClientId(data.clientId);
			}

			if (data.lastTimestamp) {
				setLastTimestamp(data.lastTimestamp);
			}
		} catch (error) {
			console.error("轮询消息出错:", error);
		}
	}, [isPolling, clientId, lastTimestamp]);

	// 启动或停止轮询
	useEffect(() => {
		if (isPolling) {
			// 开始轮询，每2秒轮询一次
			pollMessages();
			pollingIntervalRef.current = setInterval(pollMessages, 2000);
		} else if (pollingIntervalRef.current) {
			// 停止轮询
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}

		return () => {
			// 组件卸载时清除轮询
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, [isPolling, pollMessages]);

	return (
		<div className="mx-auto max-w-lg rounded-lg bg-white p-4 shadow-md">
			<h1 className="mb-4 font-bold text-xl">实时消息（短轮询实现）</h1>

			{/* 消息列表 */}
			<div className="mb-4 h-80 overflow-y-auto rounded border p-2">
				{messages.length === 0 ? (
					<p className="text-center text-gray-500">暂无消息</p>
				) : (
					messages.map((msg) => (
						<div key={msg.id} className="mb-2 rounded bg-gray-100 p-2">
							<p>{msg.content}</p>
							<small className="text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</small>
						</div>
					))
				)}
			</div>

			{/* 发送消息表单 */}
			<div className="flex">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="输入消息..."
					className="flex-1 rounded-l border p-2 focus:outline-none"
					onKeyDown={(e) => e.key === "Enter" && sendMessage()}
				/>
				<button onClick={sendMessage} className="rounded-r bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
					发送
				</button>
			</div>

			{/* 轮询控制 */}
			<div className="mt-2 flex items-center">
				<button
					onClick={() => setIsPolling(!isPolling)}
					className={`rounded px-3 py-1 text-white ${
						isPolling ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
					}`}
				>
					{isPolling ? "停止轮询" : "开始轮询"}
				</button>
				<span className="ml-2 text-gray-500 text-sm">{isPolling ? "正在轮询中..." : "轮询已停止"}</span>
			</div>
		</div>
	);
}
