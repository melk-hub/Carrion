import React from 'react';
import InvitationClient from './InvitationClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Invitation - Rejoindre une organisation',
	description: 'Vous avez été invité à rejoindre une équipe sur Carrion.',
};

export default function InvitationPage() {
	return <InvitationClient />;
}