import "@/styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "Hono客户端管理系统",
	description: "通过短轮询实现的客户端管理系统",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="zh">
			<body>
				<nav className="bg-gray-800 text-white">
					<div className="container mx-auto px-6 py-3">
						<div className="flex items-center justify-between">
							<div className="font-bold text-lg">Hono客户端管理系统</div>
							<div className="space-x-4">
								<Link href="/" className="hover:text-blue-300">
									首页
								</Link>
								<Link href="/admin" className="hover:text-blue-300">
									管理页面
								</Link>
							</div>
						</div>
					</div>
				</nav>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
