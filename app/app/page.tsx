"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import toast from "react-hot-toast";

interface Bill {
  id: string;
  provider: string;
  amount: number;
  due_date: string;
  status: "open" | "paid";
  notes: string;
}

type SortOption = "value_asc" | "value_desc" | "date_old" | "date_new";

export default function HomePage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [sortBy, setSortBy] = useState<SortOption>("date_old");

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

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("status", "open")
        .order("due_date", { ascending: true });

      if (error) throw error;

      setBills(data || []);
      applyFilters(data || [], selectedDate, sortBy);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar boletos");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (billList: Bill[], date: string, sort: SortOption) => {
    // Filtrar por data igual ou posterior
    let filtered = billList.filter((b) => b.due_date >= date);

    // Aplicar ordenação
    switch (sort) {
      case "value_asc":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case "value_desc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "date_old":
        filtered.sort((a, b) => a.due_date.localeCompare(b.due_date));
        break;
      case "date_new":
        filtered.sort((a, b) => b.due_date.localeCompare(a.due_date));
        break;
    }

    setFilteredBills(filtered);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    applyFilters(bills, newDate, sortBy);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    applyFilters(bills, selectedDate, newSort);
  };

  const handleTogglePaid = async (billId: string) => {
    try {
      const { error } = await supabase
        .from("bills")
        .update({ status: "paid" })
        .eq("id", billId);

      if (error) throw error;

      toast.success("✅ Boleto marcado como pago!");
      fetchBills();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao atualizar boleto");
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalAmount = filteredBills.reduce((sum, b) => sum + b.amount, 0);
  const totalCount = filteredBills.length;

  if (loading) {
    return <Loading message="Carregando seus boletos..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header com pergunta e resposta */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12 px-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
            📅 Data da Compra?
          </h1>
          
          {/* Seletor de Data GRANDE */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full max-w-md px-8 py-6 text-3xl font-bold text-gray-800 border-4 border-white rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400"
            />
          </div>

          {/* Resposta automática */}
          <Card className="bg-white/95 backdrop-blur border-4 border-yellow-400 shadow-2xl">
            <div className="text-center py-6">
              <p className="text-2xl md:text-3xl text-gray-800 font-semibold mb-4">
                Para essa data você tem
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-6">
                <div className="bg-red-100 border-4 border-red-500 rounded-2xl px-8 py-6 min-w-[200px]">
                  <p className="text-6xl font-bold text-red-600">{totalCount}</p>
                  <p className="text-xl font-semibold text-gray-700 mt-2">
                    {totalCount === 1 ? "Boleto" : "Boletos"}
                  </p>
                </div>
                <div className="text-4xl font-bold text-gray-600">
                  totalizando
                </div>
                <div className="bg-green-100 border-4 border-green-500 rounded-2xl px-8 py-6 min-w-[280px]">
                  <p className="text-5xl font-bold text-green-600">
                    R$ {totalAmount.toFixed(2)}
                  </p>
                  <p className="text-xl font-semibold text-gray-700 mt-2">
                    em aberto
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filtros de Ordenação */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-gray-200">
          <p className="text-2xl font-bold text-gray-800 mb-4">
            🔽 Ordenar por:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleSortChange("value_asc")}
              className={`px-6 py-5 text-xl font-bold rounded-xl border-4 transition-all ${
                sortBy === "value_asc"
                  ? "bg-blue-600 text-white border-blue-800 shadow-lg scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              💰 Menor Valor → Maior
            </button>
            <button
              onClick={() => handleSortChange("value_desc")}
              className={`px-6 py-5 text-xl font-bold rounded-xl border-4 transition-all ${
                sortBy === "value_desc"
                  ? "bg-blue-600 text-white border-blue-800 shadow-lg scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              💵 Maior Valor → Menor
            </button>
            <button
              onClick={() => handleSortChange("date_old")}
              className={`px-6 py-5 text-xl font-bold rounded-xl border-4 transition-all ${
                sortBy === "date_old"
                  ? "bg-blue-600 text-white border-blue-800 shadow-lg scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              📅 Mais Antigo
            </button>
            <button
              onClick={() => handleSortChange("date_new")}
              className={`px-6 py-5 text-xl font-bold rounded-xl border-4 transition-all ${
                sortBy === "date_new"
                  ? "bg-blue-600 text-white border-blue-800 shadow-lg scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              📆 Mais Recente
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Boletos */}
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {filteredBills.length === 0 ? (
          <Card className="bg-white border-4 border-gray-200 shadow-xl">
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🎉</p>
              <p className="text-3xl font-bold text-gray-700">
                Nenhum boleto para esta data!
              </p>
              <p className="text-xl text-gray-500 mt-4">
                Você está em dia com os pagamentos
              </p>
            </div>
          </Card>
        ) : (
          filteredBills.map((bill) => {
            const dueDate = new Date(bill.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isOverdue = dueDate < today;

            return (
              <Card
                key={bill.id}
                className={`border-l-8 shadow-2xl hover:scale-102 transition-transform ${
                  isOverdue
                    ? "border-red-600 bg-red-50"
                    : "border-blue-600 bg-white"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
                  {/* Info Principal */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-bold text-gray-900 mb-3 break-words">
                      {bill.provider}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xl">
                      <span className="font-semibold text-gray-600">
                        📅 Vencimento:
                      </span>
                      <span
                        className={`font-bold ${
                          isOverdue ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {new Date(bill.due_date).toLocaleDateString("pt-BR")}
                      </span>
                      {isOverdue && (
                        <span className="bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                          ⚠️ ATRASADO
                        </span>
                      )}
                    </div>
                    {bill.notes && (
                      <p className="text-lg text-gray-600 mt-3 break-words">
                        📝 {bill.notes}
                      </p>
                    )}
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-xl border-4 border-green-700">
                      <p className="text-4xl font-bold">
                        R$ {bill.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleTogglePaid(bill.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg border-4 border-green-800 transition-all hover:scale-105"
                      >
                        ✅ Pagar
                      </button>
                      <button
                        onClick={() => router.push(`/app/bills/${bill.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg border-4 border-blue-800 transition-all hover:scale-105"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Botão Flutuante FAB */}
      <button
        onClick={() => router.push("/app/bills/new")}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full p-8 shadow-2xl border-8 border-white transition-all hover:scale-110 z-50 animate-bounce"
        style={{ width: "100px", height: "100px" }}
      >
        <span className="text-5xl font-bold">+</span>
      </button>

      {/* Botão para Relatórios */}
      <button
        onClick={() => router.push("/app/reports")}
        className="fixed bottom-8 left-8 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl px-8 py-6 shadow-2xl border-4 border-purple-800 transition-all hover:scale-105 z-50"
      >
        <span className="text-2xl font-bold">📊 Relatórios</span>
      </button>
    </div>
  );
}
