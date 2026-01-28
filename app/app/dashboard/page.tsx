"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import toast from "react-hot-toast";

interface BillSummary {
  overdue_count: number;
  overdue_amount: number;
  due_week_count: number;
  due_week_amount: number;
  total_open: number;
  total_open_amount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<BillSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch bills for summary
      const { data: bills } = await supabase
        .from("bills")
        .select("id, amount, due_date, status")
        .eq("status", "open");

      if (bills) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const overdue = bills.filter((b) => new Date(b.due_date) < today);
        const dueWeek = bills.filter(
          (b) =>
            new Date(b.due_date) >= today &&
            new Date(b.due_date) <= nextWeek
        );

        setSummary({
          overdue_count: overdue.length,
          overdue_amount: overdue.reduce((sum, b) => sum + b.amount, 0),
          due_week_count: dueWeek.length,
          due_week_amount: dueWeek.reduce((sum, b) => sum + b.amount, 0),
          total_open: bills.length,
          total_open_amount: bills.reduce((sum, b) => sum + b.amount, 0),
        });
      }
    } catch (error) {
      console.error("Erro ao buscar resumo:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Carregando resumo..." />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard Sena Vip</h1>
        <p className="text-xl text-gray-600 mt-2">Visão geral dos boletos da empresa</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Atrasados */}
        <Card className="border-l-4 border-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-2">⏰ Atrasados</p>
              <p className="text-4xl font-bold text-red-600">{summary?.overdue_count || 0}</p>
              <p className="text-lg text-gray-600 mt-2">
                R$ {(summary?.overdue_amount || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-5xl opacity-20">📅</div>
          </div>
        </Card>

        {/* Vencem em 7 dias */}
        <Card className="border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-2">⚠️ Próximos 7 dias</p>
              <p className="text-4xl font-bold text-yellow-600">{summary?.due_week_count || 0}</p>
              <p className="text-lg text-gray-600 mt-2">
                R$ {(summary?.due_week_amount || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
        </Card>

        {/* Total em aberto */}
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-2">💳 Total em aberto</p>
              <p className="text-4xl font-bold text-blue-600">{summary?.total_open || 0}</p>
              <p className="text-lg text-gray-600 mt-2">
                R$ {(summary?.total_open_amount || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-5xl opacity-20">💰</div>
          </div>
        </Card>
      </div>

      {/* Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Button
          size="lg"
          onClick={() => router.push("/app/bills")}
          className="h-20 text-xl"
        >
          👁️ Ver por data
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => router.push("/app/bills/new")}
          className="h-20 text-xl"
        >
          ➕ Cadastrar boleto
        </Button>
      </div>

      {/* Informação familia */}
      <Card className="bg-blue-50 border-blue-200 mt-12">
        <p className="text-lg text-gray-700">
          👨‍👩‍👧 <strong>Dica:</strong> Compartilhe sua "Conta Família" com outras pessoas para que vejam os mesmos boletos. Vá em "Convites" (em breve) para adicionar membros.
        </p>
      </Card>
    </div>
  );
}
