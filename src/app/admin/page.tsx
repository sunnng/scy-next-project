"use client";

import { useCallback, useEffect, useState } from "react";
import ClientList from "../../components/admin/ClientList";
import CommandForm from "../../components/admin/CommandForm";

interface ClientInfo {
	id: string;
	isOnline: boolean;
	lastSeen: number;
	deviceInfo: string;
	pendingCommandsCount: number;
}

export default function AdminPage() {
	const [clients, setClients] = useState<ClientInfo[]>([]);
	const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 获取所有客户端状态
	const fetchClients = useCallback(async () => {
		try {
			const response = await fetch("/api/hono/admin/clients");
			if (!response.ok) {
				throw new Error("获取客户端列表失败");
			}
			const data = await response.json();
			setClients(data.clients || []);
			setError(null);
		} catch (err) {
			setError(`获取客户端列表出错: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setLoading(false);
		}
	}, []);

	// 发送命令到客户端
	const sendCommand = async (commandType: string, commandPayload: any) => {
		if (!selectedClientId) {
			setError("请先选择一个客户端");
			return false;
		}

		try {
			const response = await fetch("/api/hono/admin/send-command", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					clientId: selectedClientId,
					commandType,
					commandPayload,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "发送命令失败");
			}

			// 刷新客户端列表以更新挂起命令计数
			fetchClients();
			return true;
		} catch (err) {
			setError(`发送命令出错: ${err instanceof Error ? err.message : String(err)}`);
			return false;
		}
	};

	// 选择客户端
	const selectClient = (clientId: string) => {
		setSelectedClientId(clientId);
		setError(null);
	};

	// 初始加载和定期刷新
	useEffect(() => {
		fetchClients();

		// 每10秒刷新一次客户端列表
		const intervalId = setInterval(fetchClients, 10000);

		return () => clearInterval(intervalId);
	}, [fetchClients]);

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-6 text-center font-bold text-2xl">客户端管理系统</h1>

			{error && (
				<div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
					<p>{error}</p>
				</div>
			)}

			<div className="grid gap-6 md:grid-cols-2">
				{/* 左侧：客户端列表 */}
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<h2 className="mb-4 font-semibold text-xl">客户端列表</h2>
					<ClientList
						clients={clients}
						loading={loading}
						selectedClientId={selectedClientId}
						onSelectClient={selectClient}
					/>
				</div>

				{/* 右侧：命令发送 */}
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<h2 className="mb-4 font-semibold text-xl">发送命令</h2>
					<CommandForm selectedClientId={selectedClientId} onSendCommand={sendCommand} disabled={!selectedClientId} />
				</div>
			</div>
		</div>
	);
}
