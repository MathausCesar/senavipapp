"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { BillCreateSchema, BillFormData } from "@/lib/types";
import toast from "react-hot-toast";

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BillFormData>({
    provider: "",
    amount: 0,
    due_date: new Date().toISOString().split("T")[0],
    status: "open",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Garantir que exista uma família para o usuário (cria se não houver)
      const familyId = await ensureFamily(user.id);

      // Create bill
      const { error } = await supabase.from("bills").insert({
        family_id: familyId,
        provider: formData.provider,
        amount: formData.amount,
        due_date: formData.due_date,
        status: formData.status,
        notes: formData.notes || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Boleto criado com sucesso!");
      router.push("/app/bills");
    } catch (error: any) {
      console.error("Erro ao criar boleto:", error);
      const message = error?.message || "Erro ao criar boleto";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Cria/obtém família do usuário logado
  const ensureFamily = async (userId: string): Promise<string> => {
    // Tenta obter família existente
    const { data: familyData, error: familyErr } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .single();

    if (familyData?.family_id) return familyData.family_id;
    if (familyErr && familyErr.code !== "PGRST116") throw familyErr; // erro diferente de "no rows"

    // Cria família e membro owner
    const { data: newFamily, error: createFamErr } = await supabase
      .from("families")
      .insert({ owner_id: userId, name: "Minha Família" })
      .select("id")
      .single();

    if (createFamErr || !newFamily?.id) {
      throw createFamErr || new Error("Falha ao criar família");
    }

    const { error: memberErr } = await supabase
      .from("family_members")
      .insert({ family_id: newFamily.id, user_id: userId, role: "owner" });

    if (memberErr) throw memberErr;

    return newFamily.id;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">➕ Novo Boleto</h1>
        <p className="text-lg text-gray-600 mt-2">
          Preencha os dados abaixo para cadastrar um novo boleto
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
            disabled={loading}
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
            disabled={loading}
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
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-700"
              disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-24 resize-none bg-white text-gray-900 placeholder:text-gray-600"
              disabled={loading}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? "Salvando..." : "💾 Salvar boleto"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              ❌ Cancelar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <p className="text-lg text-gray-700">
          💡 <strong>Dica:</strong> Preenchendo todos os campos, você garante melhor organização dos seus boletos. Aproveite!
        </p>
      </Card>
    </div>
  );
}
