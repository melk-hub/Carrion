import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ApiService from "@/services/api";
import SettingsClient from "./SettingsClient";
import { GoalSettings } from "@/interface/misc.interface";

async function getSettingsData() {
	const cookieStore = await cookies();
	const token = cookieStore.get("access_token");

	if (!token) {
		redirect("/settings");
	}

	const headers = { Cookie: `${token.name}=${token.value}` };

	try {
		const data = await ApiService.get<GoalSettings>("/settings/goal", {
			headers,
		});
		return {
			initialGoalSettings: data,
			error: null,
		};
	} catch (error: unknown) {
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}

		const errorMessage =
			error instanceof Error
				? error.message
				: "Impossible de charger les paramètres.";
		return {
			initialGoalSettings: null,
			error: errorMessage,
		};
	}
}

export default async function SettingsPage() {
	const { initialGoalSettings, error } = await getSettingsData();

	return (
		<SettingsClient initialGoalSettings={initialGoalSettings} error={error} />
	);
}