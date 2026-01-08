import { Suspense } from "react";
import NotificationsClient from "./NotificationsClient";
import Loading from "@/components/Loading/Loading";

export const dynamic = "force-dynamic";

export default function NotificationPage() {
	return (
		<Suspense fallback={<Loading />}>
			<NotificationsClient />
		</Suspense>
	);
}