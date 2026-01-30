"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Tabs } from "@/components/Tabs";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/Badge";
import toast from "react-hot-toast";

interface Bill {
  id: string;
  provider: string;
  amount: number;
  due_date: string;
  status: "open" | "paid";
  notes: string;
  attachment_url?: string;
}

type FilterTab = "by_date" | "overdue" | "paid";

export default function BillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("by_date");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    d.setDate(d.getDate() + (7 - dayOfWeek)); // Final da semana
    return d.toISOString().split("T")[0];
  });
  const [quickRange, setQuickRange] = useState<"today" | "week" | "month" | "custom">("week");

  // Aplicar filtros da URL ao carregar
  useEffect(() => {
    const tab = searchParams.get("tab");
    const range = searchParams.get("range") as "today" | "week" | "month" | "custom" | null;
    
    if (tab) {
      if (tab === "overdue") setActiveTab("overdue");
      else if (tab === "paid") setActiveTab("paid");
      else setActiveTab("by_date");
    }
    
    if (range && tab === "by_date") {
      if (range === "today" || range === "week" || range === "month") {
        applyQuickRange(range);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch bills
      const { data: billsData, error } = await supabase
        .from("bills")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setBills(billsData || []);
    } catch (error) {
      console.error("Erro ao buscar boletos:", error);
      toast.error("Erro ao carregar boletos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = bills;

    if (activeTab === "by_date") {
      // Mostrar boletos no período selecionado (apenas abertos)
      const from = startDate || new Date().toISOString().split("T")[0];
      const to = endDate || from;
      result = bills.filter(
        (b) => b.status === "open" && b.due_date >= from && b.due_date <= to
      );
    } else if (activeTab === "overdue") {
      // Mostrar atrasados (vencimento < hoje, status aberto)
      const today = new Date().toISOString().split("T")[0];
      result = bills.filter(
        (b) => b.due_date < today && b.status === "open"
      );
    } else if (activeTab === "paid") {
      // Mostrar pagos
      result = bills.filter((b) => b.status === "paid");
    }

    setFilteredBills(result);
  };
  
  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, startDate, endDate, bills]);
  
  const handleTogglePaid = async (billId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "open" ? "paid" : "open";
      const { error } = await supabase
        .from("bills")
        .update({ status: newStatus })
        .eq("id", billId);

      if (error) throw error;

      toast.success(
        newStatus === "paid" ? "Marcado como pago" : "Reaberto"
      );
      fetchBills();
    } catch (error) {
      console.error("Erro ao atualizar boleto:", error);
      toast.error("Erro ao atualizar boleto");
    }
  };

  const handleDelete = async (billId: string) => {
    if (!confirm("Tem certeza que deseja deletar este boleto?")) return;

    try {
      const { error } = await supabase.from("bills").delete().eq("id", billId);

      if (error) throw error;

      toast.success("Boleto deletado");
      fetchBills();
    } catch (error) {
      console.error("Erro ao deletar boleto:", error);
      toast.error("Erro ao deletar boleto");
    }
  };

  const handleEdit = (billId: string) => {
    router.push(`/app/bills/${billId}/edit`);
  };

  const getStatusColor = (status: string) => {
    if (status === "paid") return "success";
    return "info";
  };

  const getDueDateColor = (dueDate: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today) return "danger";
    if (dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) return "warning";
    return "info";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return <Loading message="Carregando boletos..." />;
  }

  const tabs: Array<{ label: string; value: FilterTab }> = [
    { label: "📅 Por Data", value: "by_date" },
    { label: "⏰ Atrasados", value: "overdue" },
    { label: "✅ Pagos", value: "paid" },
  ];

  const applyQuickRange = (range: "today" | "week" | "month") => {
    setQuickRange(range);
    const today = new Date();
    const start = today.toISOString().split("T")[0];
    let end = new Date(today);
    if (range === "week") {
      // Final da semana (domingo)
      const dayOfWeek = today.getDay();
      end.setDate(today.getDate() + (7 - dayOfWeek));
    }
    if (range === "month") {
      // Final do mês
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    const endIso = end.toISOString().split("T")[0];
    setStartDate(start);
    setEndDate(endIso);
  };

  const totalAmount = filteredBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">📋 Boletos</h1>
        <Button onClick={() => router.push("/app/bills/new")} size="md">
          ➕ Novo
        </Button>
      </div>

      {/* Abas */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(value) => setActiveTab(value as FilterTab)} />

      {/* Date picker (apenas para "Por Data") */}
      {activeTab === "by_date" && (
        <Card className="bg-blue-50">
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-700">
              Até quando?
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={quickRange === "today" ? "primary" : "secondary"}
                onClick={() => applyQuickRange("today")}
              >
                Hoje
              </Button>
              <Button
                size="sm"
                variant={quickRange === "week" ? "primary" : "secondary"}
                onClick={() => applyQuickRange("week")}
              >
                Esta semana
              </Button>
              <Button
                size="sm"
                variant={quickRange === "month" ? "primary" : "secondary"}
                onClick={() => applyQuickRange("month")}
              >
                Este mês
              </Button>
              <Button
                size="sm"
                variant={quickRange === "custom" ? "primary" : "secondary"}
                onClick={() => setQuickRange("custom")}
              >
                Personalizar
              </Button>
            </div>
            {quickRange === "custom" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">De</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">Até</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-700"
                  />
                </div>
              </div>
            ) : (
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setQuickRange("custom");
                  setEndDate(e.target.value);
                }}
                className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-700"
              />
            )}
          </div>
        </Card>
      )}

      {/* Total */}
      {filteredBills.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold">Total</p>
              <p className="text-4xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-lg text-gray-600 mt-1">
                {filteredBills.length} boleto{filteredBills.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-6xl opacity-30">💰</div>
          </div>
        </Card>
      )}

      {/* Lista de Boletos */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="Nenhum boleto encontrado"
          description={
            activeTab === "by_date"
              ? "Nenhum boleto vence até essa data"
              : activeTab === "overdue"
              ? "Ótimo! Nenhum boleto atrasado"
              : "Nenhum boleto pago"
          }
          action={
            activeTab === "by_date"
              ? {
                  label: "Cadastrar novo",
                  onClick: () => router.push("/app/bills/new"),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <Card
              key={bill.id}
              className="cursor-default hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {bill.provider}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">
                      Vencimento: {formatDate(bill.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>

                {/* Status e Badge */}
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(bill.status)}>
                    {bill.status === "paid" ? "✅ Pago" : "📭 Em aberto"}
                  </Badge>
                  {bill.status === "open" && (
                    <Badge variant={getDueDateColor(bill.due_date)}>
                      {bill.due_date < new Date().toISOString().split("T")[0]
                        ? "Atrasado"
                        : "Agendado"}
                    </Badge>
                  )}
                </div>

                {/* Notas */}
                {bill.notes && (
                  <p className="text-lg text-gray-600 bg-gray-100 p-3 rounded">
                    📝 {bill.notes}
                  </p>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    size="md"
                    variant={bill.status === "open" ? "primary" : "secondary"}
                    onClick={() => handleTogglePaid(bill.id, bill.status)}
                  >
                    {bill.status === "open"
                      ? "✅ Marcar como pago"
                      : "🔄 Reabrir"}
                  </Button>
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => handleEdit(bill.id)}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="md"
                    variant="danger"
                    onClick={() => handleDelete(bill.id)}
                  >
                    🗑️ Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
