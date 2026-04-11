import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';
import AdminDashboard from './admin-dashboard';

export default async function DashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return <AdminDashboard />;
}
