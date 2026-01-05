import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ApiService from "@/services/api";
import ProfileClient from "./ProfileClient";
import Loading from "@/components/Loading/Loading";
import { UserProfile, ConnectedService } from "@/interface/user.interface";

export const dynamic = "force-dynamic";

async function getProfileData() {
	const cookieStore = await cookies();
	const token = cookieStore.get("access_token");

	if (!token) {
		redirect("/auth/signin");
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
		if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}

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

	return (
		<Suspense fallback={<Loading />}>
			<ProfileClient {...profileData} />
		</Suspense>
	);
}