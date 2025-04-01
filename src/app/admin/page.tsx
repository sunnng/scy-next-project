"use client";

import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useState } from "react";
import ClientList from "../../components/admin/ClientList";
import CommandForm from "../../components/admin/CommandForm";

interface ClientInfo {
	id: string;
	deviceId: string;
	isOnline: boolean;
	lastSeen: number;
	foregroundApp: string;
	isForeground: boolean;
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

	// 获取已选中的客户端信息
	const selectedClient = clients.find((client) => client.id === selectedClientId);

	return (
		<div className="container mx-auto max-w-6xl p-4">
			<div className="flex flex-col">
				<h1 className="mb-2 font-bold text-3xl tracking-tight">设备管理</h1>
				<p className="mb-6 text-muted-foreground">监控设备状态并发送指令</p>

				{error && (
					<div className="mb-4 rounded-md bg-destructive/15 p-3 text-destructive">
						<p>{error}</p>
					</div>
				)}

				<div className="grid gap-6 md:grid-cols-2">
					{/* 左侧：客户端列表 */}
					<div>
						<h2 className="mb-4 font-semibold text-xl">客户端列表</h2>
						<ClientList
							clients={clients}
							loading={loading}
							selectedClientId={selectedClientId}
							onSelectClient={selectClient}
						/>
					</div>

					{/* 右侧：命令发送 */}
					<div>
						{selectedClient && (
							<div className="mb-4">
								<h2 className="font-semibold text-xl">已选择的设备</h2>
								<p className="mb-2 text-muted-foreground">设备ID: {selectedClient.deviceId}</p>
								<div className="mb-4 flex gap-2">
									<span
										className={`rounded-full px-2 py-1 text-xs ${selectedClient.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
									>
										{selectedClient.isOnline ? "在线" : "离线"}
									</span>
									<span
										className={`rounded-full px-2 py-1 text-xs ${selectedClient.isForeground ? "bg-purple-100 text-purple-800" : "bg-yellow-100 text-yellow-800"}`}
									>
										{selectedClient.isForeground ? "前台" : "后台"}
									</span>
									<span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800 text-xs">
										{selectedClient.foregroundApp}
									</span>
								</div>
								<Separator className="my-4" />
							</div>
						)}
						<CommandForm selectedClientId={selectedClientId} onSendCommand={sendCommand} disabled={!selectedClientId} />
					</div>
				</div>
			</div>
		</div>
	);
}
