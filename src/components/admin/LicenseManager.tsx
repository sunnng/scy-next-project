"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

interface LicenseKey {
	id: string;
	key: string;
	type: string;
	status: string;
	createdAt: string;
	usedAt: string | null;
	expiresAt: string | null;
	usedBy: string | null;
	notes: string | null;
}

export default function LicenseManager() {
	const [activeTab, setActiveTab] = useState("generate");
	const [loading, setLoading] = useState(false);
	const [licenses, setLicenses] = useState<LicenseKey[]>([]);
	const [formData, setFormData] = useState({
		name: "",
		type: "monthly",
		count: 1,
		duration: 30,
		notes: "",
	});

	// 生成卡密
	const handleGenerate = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/license", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("生成卡密失败");

			const data = await response.json();
			toast.success(`已生成 ${formData.count} 个卡密`);
			fetchLicenses();
		} catch (error) {
			toast.error("生成卡密失败");
		} finally {
			setLoading(false);
		}
	};

	// 获取卡密列表
	const fetchLicenses = async () => {
		try {
			const response = await fetch("/api/license");
			if (!response.ok) throw new Error("获取卡密列表失败");
			const data = await response.json();
			setLicenses(data.licenses);
		} catch (error) {
			toast.error("获取卡密列表失败");
		}
	};

	// 格式化时间
	const formatDate = (date: string | null) => {
		if (!date) return "未使用";
		return new Date(date).toLocaleString();
	};

	return (
		<div className="space-y-4">
			<Tabs defaultValue="generate" onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="generate">生成卡密</TabsTrigger>
					<TabsTrigger value="list">卡密列表</TabsTrigger>
				</TabsList>

				<TabsContent value="generate">
					<Card>
						<CardHeader>
							<CardTitle>生成新卡密</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>批次名称</Label>
								<Input
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="输入批次名称"
								/>
							</div>

							<div className="space-y-2">
								<Label>卡密类型</Label>
								<Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monthly">月度卡密</SelectItem>
										<SelectItem value="yearly">年度卡密</SelectItem>
										<SelectItem value="lifetime">永久卡密</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>生成数量</Label>
									<Input
										type="number"
										value={formData.count}
										onChange={(e) => setFormData({ ...formData, count: Number.parseInt(e.target.value) })}
										min={1}
									/>
								</div>
								<div className="space-y-2">
									<Label>有效期（天）</Label>
									<Input
										type="number"
										value={formData.duration}
										onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
										min={1}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label>备注</Label>
								<Textarea
									value={formData.notes}
									onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
									placeholder="输入备注信息"
								/>
							</div>

							<Button onClick={handleGenerate} disabled={loading}>
								{loading ? "生成中..." : "生成卡密"}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="list">
					<Card>
						<CardHeader>
							<CardTitle>卡密列表</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[600px]">
								<div className="space-y-4">
									{licenses.map((license) => (
										<Card key={license.id}>
											<CardContent className="p-4">
												<div className="flex items-center justify-between">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<span className="font-mono">{license.key}</span>
															<Badge variant={license.status === "unused" ? "default" : "secondary"}>
																{license.status === "unused" ? "未使用" : "已使用"}
															</Badge>
														</div>
														<div className="text-muted-foreground text-sm">
															<div>类型: {license.type}</div>
															<div>创建时间: {formatDate(license.createdAt)}</div>
															<div>使用时间: {formatDate(license.usedAt)}</div>
															<div>过期时间: {formatDate(license.expiresAt)}</div>
															{license.notes && <div>备注: {license.notes}</div>}
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
