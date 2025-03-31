"use client";

import { type FormEvent, useState } from "react";

// 预定义命令类型列表
const COMMAND_TYPES = [
	{ value: "restart", label: "重启设备" },
	{ value: "update", label: "更新固件" },
	{ value: "collect_data", label: "采集数据" },
	{ value: "change_config", label: "修改配置" },
	{ value: "custom", label: "自定义命令" },
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

			// 解析有效载荷（如果存在）
			let payload = {};
			if (commandPayload.trim()) {
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
				setCommandPayload("");
			}
		} finally {
			setIsSending(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			{!selectedClientId && (
				<div className="mb-4 rounded-md bg-yellow-100 p-3 text-yellow-700">
					<p>请先从左侧选择一个客户端</p>
				</div>
			)}

			{success && (
				<div className="mb-4 rounded-md bg-green-100 p-3 text-green-700">
					<p>命令发送成功！</p>
				</div>
			)}

			<div className="mb-4">
				<label className="mb-1 block font-medium text-gray-700 text-sm">命令类型</label>
				<select
					value={commandType}
					onChange={(e) => setCommandType(e.target.value)}
					className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
					disabled={disabled || isSending}
				>
					{COMMAND_TYPES.map((type) => (
						<option key={type.value} value={type.value}>
							{type.label}
						</option>
					))}
				</select>
			</div>

			{commandType === "custom" && (
				<div className="mb-4">
					<label className="mb-1 block font-medium text-gray-700 text-sm">自定义命令名称</label>
					<input
						type="text"
						value={customCommandType}
						onChange={(e) => setCustomCommandType(e.target.value)}
						className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
						placeholder="输入自定义命令名称"
						disabled={disabled || isSending}
						required={commandType === "custom"}
					/>
				</div>
			)}

			<div className="mb-4">
				<label className="mb-1 block font-medium text-gray-700 text-sm">命令参数 (JSON格式，可选)</label>
				<textarea
					value={commandPayload}
					onChange={(e) => setCommandPayload(e.target.value)}
					className="h-32 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
					placeholder='例如: {"key": "value"} 或 留空'
					disabled={disabled || isSending}
				/>
			</div>

			<button
				type="submit"
				className="w-full rounded-md bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
				disabled={disabled || isSending || (commandType === "custom" && !customCommandType)}
			>
				{isSending ? "发送中..." : "发送命令"}
			</button>
		</form>
	);
}
