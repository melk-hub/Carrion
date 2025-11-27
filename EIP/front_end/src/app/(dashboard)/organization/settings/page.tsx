// app/organization/settings/page.tsx
import React from 'react';
import OrganizationSettingsClient from './OrganizationSettingsClient';

export const metadata = {
  title: "Organization Settings - Carrion",
  description: "Manage your Carrion organization here",
};

export default function OrganizationSettingsPage() {
  return <OrganizationSettingsClient />;
}