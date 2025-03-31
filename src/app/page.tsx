import MessagePolling from "../components/MessagePolling";

export default function Home() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-8 text-center font-bold text-2xl">Hono短轮询实时通信示例</h1>
			<MessagePolling />
		</div>
	);
}
