"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";
import { type FormEvent, useState } from "react";

// 预定义命令类型列表
const COMMAND_TYPES = [
	{ value: "restart", label: "重启设备" },
	{ value: "update", label: "更新固件" },
	{ value: "toggle_foreground", label: "切换前台/后台状态" },
	{ value: "switch_app", label: "切换应用" },
	{ value: "custom", label: "自定义命令" },
];

// 预设应用列表
const PRESET_APPS = [
	{ value: "Browser", label: "浏览器" },
	{ value: "Settings", label: "设置" },
	{ value: "Camera", label: "相机" },
	{ value: "Messages", label: "消息" },
	{ value: "Music", label: "音乐" },
	{ value: "custom", label: "自定义应用" },
];

interface CommandFormProps {
	selectedClientId: string | null;
	onSendCommand: (commandType: string, commandPayload: any) => Promise<boolean>;
	disabled: boolean;
}

export default function CommandForm({ selectedClientId, onSendCommand, disabled }: CommandFormProps) {
	const [commandType, setCommandType] = useState("restart");
	const [customCommandType, setCustomCommandType] = useState("");
	const [commandPayload, setCommandPayload] = useState("");
	const [selectedApp, setSelectedApp] = useState(PRESET_APPS[0]?.value || "Browser");
	const [customApp, setCustomApp] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [success, setSuccess] = useState(false);

	// 处理表单提交
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!selectedClientId) return;

		setIsSending(true);
		setSuccess(false);

		try {
			// 确定要发送的命令类型
			const finalCommandType = commandType === "custom" ? customCommandType : commandType;

			// 根据命令类型构建不同的payload
			let payload = {};

			if (commandType === "switch_app") {
				const appName = selectedApp === "custom" ? customApp : selectedApp;
				payload = { appName };
			} else if (commandPayload.trim()) {
				try {
					payload = JSON.parse(commandPayload);
				} catch (error) {
					// 如果不是有效的JSON，则作为字符串处理
					payload = { value: commandPayload };
				}
			}

			const result = await onSendCommand(finalCommandType, payload);
			if (result) {
				setSuccess(true);
				// 重置表单（仅当是自定义命令时才重置）
				if (commandType === "custom") {
					setCustomCommandType("");
				}
				if (selectedApp === "custom") {
					setCustomApp("");
				}
				setCommandPayload("");
			}
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>发送命令</CardTitle>
				<CardDescription>选择命令类型并填写必要参数</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{!selectedClientId && (
						<Alert variant="warning">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>请注意</AlertTitle>
							<AlertDescription>请先从左侧选择一个客户端</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert variant="success">
							<CheckCircle className="h-4 w-4" />
							<AlertTitle>成功</AlertTitle>
							<AlertDescription>命令发送成功！</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Label htmlFor="command-type">命令类型</Label>
						<Select value={commandType} onValueChange={setCommandType} disabled={disabled || isSending}>
							<SelectTrigger id="command-type">
								<SelectValue placeholder="选择命令类型" />
							</SelectTrigger>
							<SelectContent>
								{COMMAND_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{commandType === "custom" && (
						<div className="space-y-2">
							<Label htmlFor="custom-command">自定义命令名称</Label>
							<Input
								id="custom-command"
								value={customCommandType}
								onChange={(e) => setCustomCommandType(e.target.value)}
								placeholder="输入自定义命令名称"
								disabled={disabled || isSending}
								required
							/>
						</div>
					)}

					{commandType === "switch_app" && (
						<div className="space-y-2">
							<Label htmlFor="app-select">选择应用</Label>
							<Select value={selectedApp} onValueChange={setSelectedApp} disabled={disabled || isSending}>
								<SelectTrigger id="app-select">
									<SelectValue placeholder="选择应用" />
								</SelectTrigger>
								<SelectContent>
									{PRESET_APPS.filter((app) => app.value !== "custom").map((app) => (
										<SelectItem key={app.value} value={app.value}>
											{app.label}
										</SelectItem>
									))}
									<SelectItem value="custom">自定义应用</SelectItem>
								</SelectContent>
							</Select>

							{selectedApp === "custom" && (
								<div className="mt-2">
									<Label htmlFor="custom-app">自定义应用名称</Label>
									<Input
										id="custom-app"
										value={customApp}
										onChange={(e) => setCustomApp(e.target.value)}
										placeholder="输入应用名称"
										disabled={disabled || isSending}
										required
									/>
								</div>
							)}
						</div>
					)}

					{commandType !== "toggle_foreground" && commandType !== "switch_app" && (
						<div className="space-y-2">
							<Label htmlFor="command-payload">命令参数 (JSON格式，可选)</Label>
							<Textarea
								id="command-payload"
								value={commandPayload}
								onChange={(e) => setCommandPayload(e.target.value)}
								placeholder='例如: {"key": "value"} 或 留空'
								disabled={disabled || isSending}
								className="h-32"
							/>
						</div>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={
							disabled ||
							isSending ||
							(commandType === "custom" && !customCommandType) ||
							(commandType === "switch_app" && selectedApp === "custom" && !customApp)
						}
					>
						{isSending ? "发送中..." : "发送命令"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
