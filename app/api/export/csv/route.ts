import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function isValidDateParam(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if ((from && !isValidDateParam(from)) || (to && !isValidDateParam(to))) {
    return NextResponse.json(
      { error: "Use YYYY-MM-DD for from and to dates." },
      { status: 400 },
    );
  }

  let query = supabase
    .from("expenses")
    .select("expense_date, amount, note, payment_method, categories(name)")
    .order("expense_date", { ascending: false });

  if (isValidDateParam(from)) {
    query = query.gte("expense_date", from);
  }
  if (isValidDateParam(to)) {
    query = query.lte("expense_date", to);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = "date,amount,category,note,payment_method";
  const rows = (data ?? []).map((row) => {
    const cat = row.categories as
      | { name: string }
      | { name: string }[]
      | null;
    const categoryName = Array.isArray(cat) ? cat[0]?.name : cat?.name;
    return [
      escapeCsv(row.expense_date),
      String(row.amount),
      escapeCsv(categoryName ?? ""),
      escapeCsv(row.note ?? ""),
      escapeCsv(row.payment_method ?? ""),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  const range =
    isValidDateParam(from) && isValidDateParam(to)
      ? `${from}_to_${to}`
      : isValidDateParam(from)
        ? `from_${from}`
        : isValidDateParam(to)
          ? `to_${to}`
          : new Date().toISOString().slice(0, 10);
  const filename = `poysapath-expenses-${range}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
