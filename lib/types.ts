import { z } from "zod";

export const BillCreateSchema = z.object({
  provider: z.string().min(1, "Fornecedor é obrigatório"),
  amount: z.number().positive("Valor deve ser maior que 0"),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
  status: z.enum(["open", "paid"]).default("open"),
  notes: z.string().optional().default(""),
});

export type BillFormData = z.infer<typeof BillCreateSchema>;

export interface Bill extends BillFormData {
  id: string;
  family_id: string;
  created_by: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}
