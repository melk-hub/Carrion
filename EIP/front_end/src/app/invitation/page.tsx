import React, { Suspense } from 'react';
import InvitationClient from './InvitationClient';
import Loading from '@/components/Loading/Loading';

export default function InvitationPage() {
	return (
		<Suspense fallback={<Loading />}>
			<InvitationClient />
		</Suspense>
	);
}