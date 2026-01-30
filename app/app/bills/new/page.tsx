"use client";

import { useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { BillCreateSchema, BillFormData } from "@/lib/types";
import { parseBoleto, formatarLinhaDigitavel } from "@/lib/boletoParser";
import toast from "react-hot-toast";

// Lazy load do BarcodeReader para evitar SSR
const BarcodeReader = lazy(() =>
  import("@/components/BarcodeReader").then((mod) => ({ default: mod.BarcodeReader }))
);

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("manual");
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

    if (name === "amount" || name === "valor_original") {
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

  const handleBarcodeScanned = (code: string) => {
    try {
      console.log("Código escaneado:", code);
      
      // Tenta parsear o código
      const boletoData = parseBoleto(code);
      
      // Preenche o formulário com os dados extraídos
      setFormData({
        ...formData,
        provider: boletoData.bancoNome || formData.provider,
        amount: boletoData.valor,
        due_date: boletoData.vencimento.toISOString().split("T")[0],
        linha_digitavel: boletoData.linhaDigitavel,
        codigo_barras: boletoData.codigoBarras,
        banco: `${boletoData.banco} - ${boletoData.bancoNome}`,
        nosso_numero: boletoData.nossoNumero,
        valor_original: boletoData.valor,
      });

      setShowScanner(false);
      setScanMode("camera");
      toast.success("✅ Boleto lido com sucesso!");
    } catch (error: any) {
      console.error("Erro ao parsear boleto:", error);
      toast.error(`Erro ao ler boleto: ${error.message}`);
    }
  };

  const handleManualCodeEntry = () => {
    if (!formData.linha_digitavel) {
      toast.error("Digite a linha digitável do boleto");
      return;
    }

    try {
      const boletoData = parseBoleto(formData.linha_digitavel);
      
      setFormData({
        ...formData,
        provider: boletoData.bancoNome || formData.provider,
        amount: boletoData.valor,
        due_date: boletoData.vencimento.toISOString().split("T")[0],
        codigo_barras: boletoData.codigoBarras,
        banco: `${boletoData.banco} - ${boletoData.bancoNome}`,
        nosso_numero: boletoData.nossoNumero,
        valor_original: boletoData.valor,
      });

      setScanMode("camera");
      toast.success("✅ Boleto processado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao processar boleto: ${error.message}`);
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

      // Create bill
      const { error } = await supabase.from("bills").insert({
        provider: formData.provider,
        amount: formData.amount,
        due_date: formData.due_date,
        status: formData.status,
        notes: formData.notes || null,
        linha_digitavel: formData.linha_digitavel || null,
        codigo_barras: formData.codigo_barras || null,
        beneficiario: formData.beneficiario || null,
        banco: formData.banco || null,
        agencia: formData.agencia || null,
        conta: formData.conta || null,
        nosso_numero: formData.nosso_numero || null,
        documento: formData.documento || null,
        valor_original: formData.valor_original || null,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showScanner && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"><p className="text-white text-xl">Carregando câmera...</p></div>}>
          <BarcodeReader
            onScan={handleBarcodeScanned}
            onClose={() => setShowScanner(false)}
          />
        </Suspense>
      )}

      <div>
        <h1 className="text-4xl font-bold text-gray-800">➕ Novo Boleto</h1>
        <p className="text-lg text-gray-600 mt-2">
          Escaneie o boleto com a câmera ou preencha manualmente
        </p>
      </div>

      {/* Opções de entrada */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📱 Como deseja cadastrar?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={() => setShowScanner(true)}
            className="h-24 text-lg"
          >
            📷 Escanear com Câmera
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setScanMode("manual")}
            className="h-24 text-lg"
          >
            ⌨️ Digitar Manualmente
          </Button>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Linha Digitável (se modo manual) */}
          {scanMode === "manual" && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                📊 Linha Digitável do Boleto (Opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="linha_digitavel"
                  value={formData.linha_digitavel || ""}
                  onChange={handleInputChange}
                  placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
                  className="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-mono"
                  maxLength={54}
                />
                <Button
                  type="button"
                  onClick={handleManualCodeEntry}
                  disabled={!formData.linha_digitavel}
                >
                  🔍 Processar
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                💡 Cole ou digite a linha digitável para preencher automaticamente os dados
              </p>
            </div>
          )}

          {/* Indicador de leitura por câmera */}
          {scanMode === "camera" && formData.linha_digitavel && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                ✅ Boleto lido pela câmera
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setScanMode("manual");
                    setFormData({
                      provider: "",
                      amount: 0,
                      due_date: new Date().toISOString().split("T")[0],
                      status: "open",
                      notes: "",
                    });
                  }}
                >
                  🔄 Limpar
                </Button>
              </p>
              <p className="text-sm text-gray-600 mt-1 font-mono">
                {formatarLinhaDigitavel(formData.linha_digitavel)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fornecedor */}
            <Input
              label="Fornecedor / Credor"
              placeholder="Ex: Banco do Brasil"
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
              error={errors.provider}
              disabled={loading}
            />

            {/* Banco */}
            <Input
              label="Banco (Opcional)"
              placeholder="Ex: 001 - Banco do Brasil"
              name="banco"
              value={formData.banco || ""}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor */}
            <Input
              label="Valor a Pagar (R$)"
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

            {/* Valor Original */}
            <Input
              label="Valor Original (Opcional)"
              type="number"
              placeholder="0,00"
              step="0.01"
              min="0"
              name="valor_original"
              value={formData.valor_original || ""}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                disabled={loading}
              />
              {errors.due_date && (
                <p className="text-red-600 text-base mt-2">{errors.due_date}</p>
              )}
            </div>

            {/* Documento */}
            <Input
              label="Número do Documento (Opcional)"
              placeholder="Ex: 123456789"
              name="documento"
              value={formData.documento || ""}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Dados Bancários Adicionais (collapsible) */}
          <details className="border-2 border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold text-gray-700 text-lg mb-4">
              🏦 Dados Bancários Adicionais (Opcional)
            </summary>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Beneficiário"
                  placeholder="Nome do beneficiário"
                  name="beneficiario"
                  value={formData.beneficiario || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <Input
                  label="Nosso Número"
                  placeholder="Número de controle do banco"
                  name="nosso_numero"
                  value={formData.nosso_numero || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Agência"
                  placeholder="Ex: 1234-5"
                  name="agencia"
                  value={formData.agencia || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <Input
                  label="Conta"
                  placeholder="Ex: 12345-6"
                  name="conta"
                  value={formData.conta || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
          </details>

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
    </div>
  );
}
