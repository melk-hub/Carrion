import React, { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";
import Loading from "../../components/Loading/Loading";

export const dynamic = "force-dynamic";

export default function AuthPage() {
	return (
		<Suspense fallback={<Loading />}>
			<AuthCallbackClient />
		</Suspense>
	);
}