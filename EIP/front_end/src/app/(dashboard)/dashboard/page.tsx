import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ApiService from "@/services/api";
import DashboardClient from "@/app/(dashboard)/dashboard/DashboardClient";
import { Application } from "@/interface/application.interface";

export const dynamic = "force-dynamic";

async function getDashboardData() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("access_token");

		if (!token) {
			redirect("/dashboard");
		}

		const headers = { Cookie: `${token.name}=${token.value}` };

		const data = await ApiService.get<Application[]>(`/job_applies/jobApply`, {
			headers,
		});

		return {
			initialApplications: Array.isArray(data) ? data : [],
			error: null,
		};
	} catch (error: unknown) {
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}

		let errorMessage = "Impossible de charger les données du tableau de bord.";

		if (error instanceof Error) {
			errorMessage = error.message;
		}

		return {
			initialApplications: [],
			error: errorMessage,
		};
	}
}

export default async function DashboardPage() {
	const { initialApplications, error } = await getDashboardData();

	return (
		<DashboardClient initialApplications={initialApplications} error={error} />
	);
}