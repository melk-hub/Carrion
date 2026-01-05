import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ApiService from "@/services/api";
import ArchivesClient from "@/app/(dashboard)/archives/ArchivesClient";
import { Application } from "@/interface/application.interface";

export const dynamic = "force-dynamic";

async function getArchivedApplications() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("access_token");

		if (!token) {
			redirect("/auth/signin");
		}

		const headers = { Cookie: `${token.name}=${token.value}` };

		const data = await ApiService.get<Application[]>(
			`/job_applies/get_archivedJobApply`,
			{
				headers,
			}
		);

		return {
			initialApplications: Array.isArray(data) ? data : [],
			error: null,
		};
	} catch (error: unknown) {
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}

		let errorMessage = "Impossible de charger les archives.";

		if (error instanceof Error) {
			errorMessage = error.message;
		}

		return {
			initialApplications: [],
			error: errorMessage,
		};
	}
}

export default async function ArchivesPage() {
	const { initialApplications, error } = await getArchivedApplications();

	return (
		<ArchivesClient initialApplications={initialApplications} error={error} />
	);
}