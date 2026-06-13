import {
  getInvestmentPaidTotal,
  getInvestmentProgressPercent,
} from "@/lib/investments/progress";
import { createClient } from "@/lib/supabase/server";
import type {
  InvestmentKind,
  InvestmentPayment,
  InvestmentProject,
  InvestmentProjectStatus,
} from "@/lib/types";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  kind: InvestmentKind;
  target_amount: number | null;
  status: InvestmentProjectStatus;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
};

function normalizePayment(row: PaymentRow): InvestmentPayment {
  return {
    id: row.id,
    project_id: row.project_id,
    amount: Number(row.amount),
    payment_date: row.payment_date,
    note: row.note,
    created_at: row.created_at,
  };
}

function buildProject(
  row: ProjectRow,
  payments: InvestmentPayment[],
): InvestmentProject {
  const project: InvestmentProject = {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: row.kind,
    target_amount:
      row.target_amount != null ? Number(row.target_amount) : null,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    payments,
    paid_total: 0,
    progress_percent: 0,
  };
  project.paid_total = getInvestmentPaidTotal(project);
  project.progress_percent = getInvestmentProgressPercent(project);
  return project;
}

export async function getInvestmentProjects(): Promise<InvestmentProject[]> {
  const supabase = await createClient();
  const { data: projectRows, error: projectError } = await supabase
    .from("investment_projects")
    .select(
      "id, title, description, kind, target_amount, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (projectError) {
    if (projectError.code === "42P01") return [];
    throw new Error(projectError.message);
  }

  const projects = (projectRows ?? []) as ProjectRow[];
  if (projects.length === 0) return [];

  const projectIds = projects.map((p) => p.id);
  const { data: paymentRows, error: paymentError } = await supabase
    .from("investment_payments")
    .select("id, project_id, amount, payment_date, note, created_at")
    .in("project_id", projectIds)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (paymentError) throw new Error(paymentError.message);

  const paymentsByProject = new Map<string, InvestmentPayment[]>();
  for (const row of (paymentRows ?? []) as PaymentRow[]) {
    const list = paymentsByProject.get(row.project_id) ?? [];
    list.push(normalizePayment(row));
    paymentsByProject.set(row.project_id, list);
  }

  return projects.map((row) =>
    buildProject(row, paymentsByProject.get(row.id) ?? []),
  );
}

export async function getInvestmentProjectById(
  id: string,
): Promise<InvestmentProject | null> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("investment_projects")
    .select(
      "id, title, description, kind, target_amount, status, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }
  if (!row) return null;

  const { data: paymentRows, error: paymentError } = await supabase
    .from("investment_payments")
    .select("id, project_id, amount, payment_date, note, created_at")
    .eq("project_id", id)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (paymentError) throw new Error(paymentError.message);

  return buildProject(
    row as ProjectRow,
    ((paymentRows ?? []) as PaymentRow[]).map(normalizePayment),
  );
}

export async function getInvestmentPaymentById(
  id: string,
): Promise<(InvestmentPayment & { project: InvestmentProject }) | null> {
  const supabase = await createClient();
  const { data: paymentRow, error } = await supabase
    .from("investment_payments")
    .select("id, project_id, amount, payment_date, note, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }
  if (!paymentRow) return null;

  const project = await getInvestmentProjectById(paymentRow.project_id);
  if (!project) return null;

  return {
    ...normalizePayment(paymentRow as PaymentRow),
    project,
  };
}

export async function getInvestmentGrandTotal(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_payments")
    .select("amount");

  if (error) {
    if (error.code === "42P01") return 0;
    throw new Error(error.message);
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}
