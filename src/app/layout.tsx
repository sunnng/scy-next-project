import "@/styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import type { Metadata } from "next";

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
					<main className="min-h-screen">
						<TRPCReactProvider>{children}</TRPCReactProvider>
					</main>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
