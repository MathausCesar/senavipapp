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
  today_count: number;
  today_amount: number;
  next3days_count: number;
  next3days_amount: number;
  week_count: number;
  week_amount: number;
  month_pending_count: number;
  month_pending_amount: number;
  month_paid_count: number;
  month_paid_amount: number;
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

        const endOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        endOfWeek.setDate(today.getDate() + (7 - dayOfWeek));
        endOfWeek.setHours(23, 59, 59, 999);

        const next3Days = new Date(today);
        next3Days.setDate(today.getDate() + 3);
        next3Days.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const overdueBills = bills.filter((b) => {
          const dueDate = new Date(b.due_date);
          return dueDate < today;
        });

        const todayBills = bills.filter((b) => {
          const dueDate = new Date(b.due_date);
          return dueDate.toDateString() === today.toDateString();
        });

        const next3DaysBills = bills.filter((b) => {
          const dueDate = new Date(b.due_date);
          return dueDate > today && dueDate <= next3Days;
        });

        const weekBills = bills.filter((b) => {
          const dueDate = new Date(b.due_date);
          return dueDate >= today && dueDate <= endOfWeek;
        });

        const monthPendingBills = bills.filter((b) => {
          const dueDate = new Date(b.due_date);
          return dueDate >= startOfMonth && dueDate <= endOfMonth;
        });

        // Buscar boletos pagos do mês atual
        const { data: paidBills } = await supabase
          .from("bills")
          .select("*")
          .eq("status", "paid")
          .gte("due_date", startOfMonth.toISOString())
          .lte("due_date", endOfMonth.toISOString());

        setSummary({
          overdue_count: overdueBills.length,
          overdue_amount: overdueBills.reduce((sum, b) => sum + b.amount, 0),
          today_count: todayBills.length,
          today_amount: todayBills.reduce((sum, b) => sum + b.amount, 0),
          next3days_count: next3DaysBills.length,
          next3days_amount: next3DaysBills.reduce((sum, b) => sum + b.amount, 0),
          week_count: weekBills.length,
          week_amount: weekBills.reduce((sum, b) => sum + b.amount, 0),
          month_pending_count: monthPendingBills.length,
          month_pending_amount: monthPendingBills.reduce((sum, b) => sum + b.amount, 0),
          month_paid_count: paidBills?.length || 0,
          month_paid_amount: paidBills?.reduce((sum, b) => sum + b.amount, 0) || 0,
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

      {/* Cards de Resumo - Prioridade por Urgência */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CRÍTICO: Atrasados */}
        <Card 
          className="border-l-4 border-red-600 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/app/bills?tab=overdue")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">❌</span>
                <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">Atrasados</p>
              </div>
              <p className="text-4xl font-bold text-red-600">{summary?.overdue_count || 0}</p>
              <p className="text-xl font-semibold text-red-500 mt-2">
                R$ {(summary?.overdue_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">⚠️ Ação urgente necessária</p>
            </div>
          </div>
        </Card>

        {/* URGENTE: Vence Hoje */}
        <Card 
          className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/app/bills?tab=date&range=today")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">Vence Hoje</p>
              </div>
              <p className="text-4xl font-bold text-orange-600">{summary?.today_count || 0}</p>
              <p className="text-xl font-semibold text-orange-500 mt-2">
                R$ {(summary?.today_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">🕐 Pagar até hoje</p>
            </div>
          </div>
        </Card>

        {/* ATENÇÃO: Próximos 3 dias */}
        <Card 
          className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/app/bills?tab=date&range=custom")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">Próximos 3 Dias</p>
              </div>
              <p className="text-4xl font-bold text-yellow-600">{summary?.next3days_count || 0}</p>
              <p className="text-xl font-semibold text-yellow-600 mt-2">
                R$ {(summary?.next3days_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">📅 Preparar pagamento</p>
            </div>
          </div>
        </Card>

        {/* Visão Semanal */}
        <Card 
          className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/app/bills?tab=date&range=week")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📆</span>
                <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">Esta Semana</p>
              </div>
              <p className="text-4xl font-bold text-blue-600">{summary?.week_count || 0}</p>
              <p className="text-xl font-semibold text-blue-500 mt-2">
                R$ {(summary?.week_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">📊 Planejamento semanal</p>
            </div>
          </div>
        </Card>

        {/* Visão Mensal - Pendente */}
        <Card 
          className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/app/bills?tab=date&range=month")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📋</span>
                <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">Pendente Este Mês</p>
              </div>
              <p className="text-4xl font-bold text-purple-600">{summary?.month_pending_count || 0}</p>
              <p className="text-xl font-semibold text-purple-500 mt-2">
                R$ {(summary?.month_pending_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">💳 Total a pagar</p>
            </div>
          </div>
        </Card>

        {/* Saúde Financeira - Pagos */}
        <Card 
          className="border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/app/bills?tab=paid")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">Pago Este Mês</p>
              </div>
              <p className="text-4xl font-bold text-green-600">{summary?.month_paid_count || 0}</p>
              <p className="text-xl font-semibold text-green-500 mt-2">
                R$ {(summary?.month_paid_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {summary?.month_pending_count && summary?.month_paid_count 
                  ? `📈 ${Math.round((summary.month_paid_count / (summary.month_paid_count + summary.month_pending_count)) * 100)}% pagos`
                  : "📈 0% pagos"
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Insight de Performance */}
      {summary && (summary.month_paid_count > 0 || summary.overdue_count > 0) && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="text-5xl">📊</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Performance Mensal</h3>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Pagamento</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((summary.month_paid_count / (summary.month_paid_count + summary.month_pending_count)) * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Processado</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(summary.month_paid_amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Atrasos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.overdue_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold">
                    {summary.overdue_count === 0 
                      ? <span className="text-green-600">✓ Em dia</span>
                      : <span className="text-orange-600">⚠️ Requer atenção</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

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
    </div>
  );
}
