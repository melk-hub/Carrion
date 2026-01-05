import React, { Suspense } from "react";
import OrganizationClient from "./OrganizationClient";
import Loading from "@/components/Loading/Loading";

export const dynamic = "force-dynamic";

export default function OrganizationPage() {
	return (
		<Suspense fallback={<Loading />}>
			<OrganizationClient />
		</Suspense>
	);
}