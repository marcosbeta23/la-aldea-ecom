import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { esES } from "@clerk/localizations";
import AdminSidebarClient from "@/components/admin/AdminSidebarClient";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? 'staff';
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'Admin';

  return (
    <ClerkProvider localization={esES}>
      <AdminSidebarClient
        role={role}
        userEmail={userEmail}
        userButton={
          <UserButton
            afterSignOutUrl="/admin/login"
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
                userButtonPopoverCard: 'shadow-xl',
              },
            }}
          />
        }
      >
        {children}
      </AdminSidebarClient>
    </ClerkProvider>
  );
}