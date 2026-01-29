import { z } from "zod";

export const BillCreateSchema = z.object({
  provider: z.string().min(1, "Fornecedor é obrigatório"),
  amount: z.number().positive("Valor deve ser maior que 0"),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
  status: z.enum(["open", "paid"]).default("open"),
  notes: z.string().optional().default(""),
  // Novos campos para dados bancários
  linha_digitavel: z.string().optional(),
  codigo_barras: z.string().optional(),
  beneficiario: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  nosso_numero: z.string().optional(),
  documento: z.string().optional(),
  valor_original: z.number().optional(),
});

export type BillFormData = z.infer<typeof BillCreateSchema>;

export interface Bill extends BillFormData {
  id: string;
  created_by: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
}
