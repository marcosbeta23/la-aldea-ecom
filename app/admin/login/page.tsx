'use client';

import { SignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect to admin dashboard if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/admin');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading spinner while checking auth or redirecting
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-slate-400 text-sm">
            {isSignedIn ? 'Redirigiendo al panel...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">La Aldea Admin</h1>
          <p className="text-slate-400 mt-2">Panel de administración</p>
        </div>
        
        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn 
            fallbackRedirectUrl="/admin"
            appearance={{
              elements: {
                rootBox: "w-full max-w-md",
                cardBox: "shadow-2xl rounded-2xl w-full",
                card: "rounded-2xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "rounded-xl",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 rounded-xl h-12 text-base",
                formFieldInput: "rounded-xl h-12 border-slate-300",
                formFieldLabel: "text-slate-700 font-medium",
                footerAction: "hidden",
                footer: "hidden",
                dividerLine: "bg-slate-200",
                dividerText: "text-slate-400",
                identityPreviewEditButton: "text-blue-600",
                formResendCodeLink: "text-blue-600",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                showOptionalFields: false,
              },
            }}
          />
        </div>
        
        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © {new Date().getFullYear()} La Aldea · Acceso restringido
        </p>
      </div>
    </div>
  );
}
