import React, { Suspense } from 'react';
import OrganizationSettingsClient from './OrganizationSettingsClient';
import Loading from '@/components/Loading/Loading';

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Organization Settings - Carrion",
	description: "Manage your Carrion organization here",
};

export default function OrganizationSettingsPage() {
	return (
		<Suspense fallback={<Loading />}>
			<OrganizationSettingsClient />
		</Suspense>
	);
}