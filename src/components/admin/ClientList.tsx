"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ClientInfo {
	id: string;
	deviceId: string;
	isOnline: boolean;
	lastSeen: number;
	foregroundApp: string;
	isForeground: boolean;
	pendingCommandsCount: number;
}

interface ClientListProps {
	clients: ClientInfo[];
	loading: boolean;
	selectedClientId: string | null;
	onSelectClient: (clientId: string) => void;
}

export default function ClientList({ clients, loading, selectedClientId, onSelectClient }: ClientListProps) {
	const [filter, setFilter] = useState<"all" | "online" | "offline" | "foreground" | "background">("all");

	// 过滤客户端列表
	const filteredClients = clients.filter((client) => {
		if (filter === "online") return client.isOnline;
		if (filter === "offline") return !client.isOnline;
		if (filter === "foreground") return client.isForeground;
		if (filter === "background") return !client.isForeground;
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
			<Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="all">全部</TabsTrigger>
					<TabsTrigger value="online">在线</TabsTrigger>
					<TabsTrigger value="offline">离线</TabsTrigger>
					<TabsTrigger value="foreground">前台</TabsTrigger>
					<TabsTrigger value="background">后台</TabsTrigger>
				</TabsList>
				<TabsContent value={filter}>
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<span className="ml-2">加载中...</span>
						</div>
					) : filteredClients.length > 0 ? (
						<ScrollArea className="h-[400px]">
							<div className="space-y-2 p-1">
								{filteredClients.map((client) => (
									<Card
										key={client.id}
										className={`cursor-pointer transition-colors ${
											selectedClientId === client.id ? "bg-muted" : "hover:bg-muted/50"
										}`}
										onClick={() => onSelectClient(client.id)}
									>
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className={`h-3 w-3 rounded-full ${client.isOnline ? "bg-green-500" : "bg-red-500"}`} />
													<span className="font-medium">{client.deviceId}</span>
												</div>
												<div className="flex gap-2">
													<Badge variant={client.isForeground ? "secondary" : "outline"}>
														{client.isForeground ? "前台" : "后台"}
													</Badge>
													{client.pendingCommandsCount > 0 && (
														<Badge variant="default">{client.pendingCommandsCount}个命令</Badge>
													)}
												</div>
											</div>
											<div className="mt-2 text-muted-foreground text-xs">
												<div className="flex justify-between">
													<div>ID: {client.id.substring(0, 8)}...</div>
													<div>最后活动: {formatLastSeen(client.lastSeen)}</div>
												</div>
												<div className="mt-1">
													<Badge variant="outline" className="font-normal">
														{client.foregroundApp || "未知"}
													</Badge>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</ScrollArea>
					) : (
						<div className="py-8 text-center text-muted-foreground">
							{filter === "all"
								? "暂无客户端连接"
								: filter === "online"
									? "暂无在线客户端"
									: filter === "offline"
										? "暂无离线客户端"
										: filter === "foreground"
											? "暂无前台运行的客户端"
											: "暂无后台运行的客户端"}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
