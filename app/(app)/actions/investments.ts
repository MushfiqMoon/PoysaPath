"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import {
  investmentPaymentInputSchema,
  investmentProjectUpdateSchema,
  multiPaymentProjectInputSchema,
  oneTimeInvestmentInputSchema,
  type InvestmentPaymentInput,
  type InvestmentProjectUpdateInput,
  type MultiPaymentProjectInput,
  type OneTimeInvestmentInput,
} from "@/lib/validators";

function revalidateInvestmentPages(projectId?: string, paymentId?: string) {
  revalidatePath("/settings/investments", "layout");
  if (projectId) {
    revalidatePath(`/settings/investments/projects/${projectId}/edit`);
  }
  if (paymentId) {
    revalidatePath(`/settings/investments/payments/${paymentId}/edit`);
  }
}

function migrationHint(error: { code?: string; message?: string }) {
  if (error.code === "42P01") {
    return "Run migration 023_investments.sql in Supabase.";
  }
  return error.message ?? "Could not save investment.";
}

async function assertMultiPaymentProject(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createClient>
  >,
  userId: string,
  projectId: string,
) {
  const { data: project, error } = await supabase
    .from("investment_projects")
    .select("kind, status")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!project) throw new Error("Investment project not found.");
  if (project.kind !== "multi_payment") {
    throw new Error("Payments can only be added to multi-payment projects.");
  }
  if (project.status === "completed") {
    throw new Error("Completed projects cannot receive new payments.");
  }
}

export async function createOneTimeInvestment(input: OneTimeInvestmentInput) {
  const parsed = oneTimeInvestmentInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  const { data: project, error: projectError } = await supabase
    .from("investment_projects")
    .insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description?.trim() || null,
      kind: "one_time",
      target_amount: null,
      status: "active",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(migrationHint(projectError ?? { message: "Could not create project." }));
  }

  const { error: paymentError } = await supabase.from("investment_payments").insert({
    user_id: user.id,
    project_id: project.id,
    amount: parsed.amount,
    payment_date: parsed.payment_date,
    note: parsed.payment_note?.trim() || null,
  });

  if (paymentError) {
    await supabase
      .from("investment_projects")
      .delete()
      .eq("id", project.id)
      .eq("user_id", user.id);
    throw new Error(migrationHint(paymentError));
  }

  revalidateInvestmentPages(project.id);
}

export async function createMultiPaymentProject(input: MultiPaymentProjectInput) {
  const parsed = multiPaymentProjectInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  const { error } = await supabase.from("investment_projects").insert({
    user_id: user.id,
    title: parsed.title,
    description: parsed.description?.trim() || null,
    kind: "multi_payment",
    target_amount: parsed.target_amount,
    status: "active",
  });

  if (error) throw new Error(migrationHint(error));
  revalidateInvestmentPages();
}

export async function addInvestmentPayment(
  projectId: string,
  input: InvestmentPaymentInput,
) {
  const parsed = investmentPaymentInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  await assertMultiPaymentProject(supabase, user.id, projectId);

  const { error } = await supabase.from("investment_payments").insert({
    user_id: user.id,
    project_id: projectId,
    amount: parsed.amount,
    payment_date: parsed.payment_date,
    note: parsed.note?.trim() || null,
  });

  if (error) throw new Error(migrationHint(error));
  revalidateInvestmentPages(projectId);
}

export async function updateInvestmentProject(
  id: string,
  input: InvestmentProjectUpdateInput,
) {
  const parsed = investmentProjectUpdateSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  const { data: existing, error: fetchError } = await supabase
    .from("investment_projects")
    .select("kind")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) throw new Error("Investment project not found.");

  const update: Record<string, unknown> = {
    title: parsed.title,
    description: parsed.description?.trim() || null,
  };

  if (parsed.status) {
    update.status = parsed.status;
  }

  if (existing.kind === "multi_payment") {
    if (parsed.target_amount == null) {
      throw new Error("Enter a target amount for multi-payment projects.");
    }
    update.target_amount = parsed.target_amount;
  }

  const { error } = await supabase
    .from("investment_projects")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateInvestmentPages(id);
}

export async function updateInvestmentPayment(
  id: string,
  input: InvestmentPaymentInput,
) {
  const parsed = investmentPaymentInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  const { error } = await supabase
    .from("investment_payments")
    .update({
      amount: parsed.amount,
      payment_date: parsed.payment_date,
      note: parsed.note?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const { data: payment } = await supabase
    .from("investment_payments")
    .select("project_id")
    .eq("id", id)
    .maybeSingle();

  revalidateInvestmentPages(payment?.project_id, id);
}

export async function deleteInvestmentPayment(id: string) {
  const { supabase, user } = await requireActionUser();

  const { data: payment, error: fetchError } = await supabase
    .from("investment_payments")
    .select("project_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!payment) throw new Error("Payment not found.");

  const { data: project, error: projectError } = await supabase
    .from("investment_projects")
    .select("kind")
    .eq("id", payment.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) throw new Error(projectError.message);
  if (!project) throw new Error("Investment project not found.");

  if (project.kind === "one_time") {
    const { error: deleteProjectError } = await supabase
      .from("investment_projects")
      .delete()
      .eq("id", payment.project_id)
      .eq("user_id", user.id);

    if (deleteProjectError) throw new Error(deleteProjectError.message);
    revalidateInvestmentPages(payment.project_id);
    return;
  }

  const { error } = await supabase
    .from("investment_payments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateInvestmentPages(payment.project_id);
}

export async function deleteInvestmentProject(id: string) {
  const { supabase, user } = await requireActionUser();

  const { error } = await supabase
    .from("investment_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateInvestmentPages(id);
}

export async function completeInvestmentProject(id: string) {
  const { supabase, user } = await requireActionUser();

  const { error } = await supabase
    .from("investment_projects")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateInvestmentPages(id);
}
