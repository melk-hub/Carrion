import { Suspense } from "react";
import LandingPageClient from "./LandingPageClient";
import Loading from "@/components/Loading/Loading";

export const dynamic = "force-dynamic";

export default function HomePage() {
	return (
		<Suspense fallback={<Loading />}>
			<LandingPageClient />
		</Suspense>
	);
}