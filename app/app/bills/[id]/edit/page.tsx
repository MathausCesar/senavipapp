"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { BillCreateSchema, BillFormData, Bill } from "@/lib/types";
import toast from "react-hot-toast";

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BillFormData>({
    provider: "",
    amount: 0,
    due_date: new Date().toISOString().split("T")[0],
    status: "open",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchBill = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: bill, error } = await supabase
        .from("bills")
        .select("*")
        .eq("id", billId)
        .single();

      if (error) throw error;

      if (bill) {
        setFormData({
          provider: bill.provider,
          amount: bill.amount,
          due_date: bill.due_date,
          status: bill.status,
          notes: bill.notes || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar boleto:", error);
      toast.error("Boleto não encontrado");
      router.push("/app/bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = (): boolean => {
    try {
      BillCreateSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        const path = err.path[0];
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("bills")
        .update({
          provider: formData.provider,
          amount: formData.amount,
          due_date: formData.due_date,
          status: formData.status,
          notes: formData.notes || null,
        })
        .eq("id", billId);

      if (error) throw error;

      toast.success("Boleto atualizado com sucesso!");
      router.push("/app/bills");
    } catch (error) {
      console.error("Erro ao atualizar boleto:", error);
      toast.error("Erro ao atualizar boleto");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Carregando boleto..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">✏️ Editar Boleto</h1>
        <p className="text-lg text-gray-600 mt-2">
          Atualize os dados do boleto abaixo
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fornecedor */}
          <Input
            label="Fornecedor / Credor"
            placeholder="Ex: Água e Saneamento, Internet, etc."
            name="provider"
            value={formData.provider}
            onChange={handleInputChange}
            error={errors.provider}
            disabled={submitting}
          />

          {/* Valor */}
          <Input
            label="Valor (R$)"
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            name="amount"
            value={formData.amount || ""}
            onChange={handleInputChange}
            error={errors.amount}
            disabled={submitting}
          />

          {/* Data de Vencimento */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Data de Vencimento
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={submitting}
            />
            {errors.due_date && (
              <p className="text-red-600 text-base mt-2">{errors.due_date}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="open"
                  checked={formData.status === "open"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "open" | "paid" })
                  }
                  className="w-5 h-5"
                  disabled={submitting}
                />
                <span className="text-lg">📭 Em aberto</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="paid"
                  checked={formData.status === "paid"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "open" | "paid" })
                  }
                  className="w-5 h-5"
                  disabled={submitting}
                />
                <span className="text-lg">✅ Pago</span>
              </label>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Observações (Opcional)
            </label>
            <textarea
              name="notes"
              placeholder="Notas, detalhes, referência de conta, etc."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-24 resize-none"
              disabled={submitting}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "💾 Salvar alterações"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={() => router.back()}
              disabled={submitting}
            >
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
