import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { buttonVariants } from "@/components/ui/button";
import { HomeIcon, MonitorIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "设备监控与指令管理系统",
	description: "通过短轮询实现的客户端管理系统",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="zh" suppressHydrationWarning>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
						<div className="container flex h-14 items-center">
							<div className="mr-4 flex">
								<Link href="/" className="mr-2 flex items-center space-x-2">
									<MonitorIcon className="h-6 w-6" />
									<span className="hidden font-bold sm:inline-block">设备监控系统</span>
								</Link>
							</div>
							<nav className="flex items-center space-x-2">
								<Link
									href="/"
									className={buttonVariants({
										variant: "ghost",
										size: "sm",
									})}
								>
									<HomeIcon className="mr-2 h-4 w-4" />
									<span>首页</span>
								</Link>
								<Link
									href="/admin"
									className={buttonVariants({
										variant: "ghost",
										size: "sm",
									})}
								>
									<MonitorIcon className="mr-2 h-4 w-4" />
									<span>管理页面</span>
								</Link>
							</nav>
						</div>
					</header>
					<main className="min-h-screen">
						<TRPCReactProvider>{children}</TRPCReactProvider>
					</main>
					<footer className="border-t py-6 md:py-0">
						<div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
							<p className="text-center text-muted-foreground text-sm leading-loose md:text-left">
								© {new Date().getFullYear()} 设备监控与指令管理系统. 保留所有权利.
							</p>
						</div>
					</footer>
				</ThemeProvider>
			</body>
		</html>
	);
}
