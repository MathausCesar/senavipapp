"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loading } from "@/components/Loading";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  if (loading) {
    return <Loading message="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Simplificado */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl sticky top-0 z-50 border-b-8 border-yellow-400">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-bold text-white">💰 Sena Vip</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xl transition-all border-4 border-red-800 hover:scale-105 shadow-xl"
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
