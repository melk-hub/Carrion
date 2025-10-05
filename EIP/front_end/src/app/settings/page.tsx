import { cookies } from "next/headers";
import ApiService from "@/services/api";
import SettingsClient from "@/components/SettingsClient";
import { GoalSettings } from "@/interface/misc.interface";

async function getSettingsData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return {
      initialGoalSettings: null,
      error: "Utilisateur non authentifié.",
    };
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
    console.error("Failed to fetch goal settings on server:", error);
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
