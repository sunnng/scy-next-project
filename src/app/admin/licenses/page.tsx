import LicenseManager from "@/components/admin/LicenseManager";

export default function LicensesPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="mb-6 font-bold text-2xl">卡密管理</h1>
			<LicenseManager />
		</div>
	);
}
