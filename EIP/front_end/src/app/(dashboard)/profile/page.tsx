import { cookies } from "next/headers";
import ApiService from "@/services/api";
import ProfileClient from "./ProfileClient";
import { UserProfile, ConnectedService } from "@/interface/user.interface";

async function getProfileData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return {
      initialProfile: null,
      initialServices: [],
      initialCvUrl: null,
      initialProfilePictureUrl: null,
      error: "Utilisateur non authentifié.",
    };
  }

  const headers = { Cookie: `${token.name}=${token.value}` };

  try {
    const [profileRes, servicesRes, cvUrlRes, profilePicRes] =
      await Promise.all([
        ApiService.get<UserProfile>("/user-profile", { headers }),
        ApiService.get<{ services: ConnectedService[] }>(
          "/user-profile/services",
          { headers }
        ),
        ApiService.get<{ signedUrl: string }>(`/s3/download?filename=cv`, {
          headers,
        }).catch(() => null),
        ApiService.get<{ signedUrl: string }>(`/s3/download?filename=profile`, {
          headers,
        }).catch(() => null),
      ]);

    return {
      initialProfile: profileRes,
      initialServices: servicesRes?.services || [],
      initialCvUrl: cvUrlRes?.signedUrl || null,
      initialProfilePictureUrl: profilePicRes?.signedUrl || null,
      error: null,
    };
  } catch (error: unknown) {
    console.error("Failed to fetch profile data on server:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Impossible de charger le profil.";
    return {
      initialProfile: null,
      initialServices: [],
      initialCvUrl: null,
      initialProfilePictureUrl: null,
      error: errorMessage,
    };
  }
}

export default async function ProfilePage() {
  const profileData = await getProfileData();

  return <ProfileClient {...profileData} />;
}
