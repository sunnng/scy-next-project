"use client";

import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

export function ClientStatus() {
	const [onlineClients, setOnlineClients] = useState<string[]>([]);
	// 使用useState持久化clientId
	const [clientId] = useState(() => {
		// 尝试从sessionStorage获取已有的clientId
		if (typeof window !== "undefined") {
			const savedId = sessionStorage.getItem("clientId");
			return savedId || nanoid();
		}
		return nanoid();
	});

	useEffect(() => {
		// 保存clientId到sessionStorage
		if (typeof window !== "undefined") {
			sessionStorage.setItem("clientId", clientId);
		}

		const updateStatus = async () => {
			await fetch("/api/hono/update-status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ clientId }),
			});
		};

		// 初始状态上报
		updateStatus();

		// 定期心跳（每15秒）
		const heartbeat = setInterval(updateStatus, 15000);

		// 轮询在线客户端（每10秒）
		const poll = setInterval(async () => {
			const res = await fetch("/api/hono/online-clients");
			const data = await res.json();
			setOnlineClients(data.clients);
		}, 10000);

		return () => {
			clearInterval(heartbeat);
			clearInterval(poll);
		};
	}, [clientId]);

	return (
		<div>
			<h3>在线客户端 ({onlineClients.length})</h3>
			<ul>
				{onlineClients.map((client) => (
					<li key={client}>{client}</li>
				))}
			</ul>
		</div>
	);
}
