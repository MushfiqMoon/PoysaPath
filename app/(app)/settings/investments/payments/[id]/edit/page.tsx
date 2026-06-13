import { notFound } from "next/navigation";

import { PaymentForm } from "@/components/investments/payment-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getInvestmentPaymentById } from "@/lib/data/investments";

type EditPaymentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditInvestmentPaymentPage({
  params,
}: EditPaymentPageProps) {
  const { id } = await params;
  const payment = await getInvestmentPaymentById(id);

  if (!payment) {
    notFound();
  }

  const { project, ...paymentRow } = payment;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Edit payment"
        description={project.title}
        backHref="/settings/investments"
        backLabel="Investments"
      />
      <Card padding="md">
        <PaymentForm payment={paymentRow} project={project} />
      </Card>
    </div>
  );
}
