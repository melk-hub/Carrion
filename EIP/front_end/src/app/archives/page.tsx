import { cookies } from "next/headers";
import ApiService from "@/services/api";
import ArchivesClient from "@/components/ArchivesClient";
import { Application } from "@/interface/application.interface";

async function getArchivedApplications() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) {
      return { initialApplications: [], error: "Utilisateur non authentifié." };
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
    console.error("Failed to fetch archived applications on server:", error);
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
