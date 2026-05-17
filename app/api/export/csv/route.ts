import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("expenses")
    .select(
      "expense_date, amount, note, payment_method, categories(name)",
    )
    .order("expense_date", { ascending: false });

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
  const filename = `poysapath-expenses-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
