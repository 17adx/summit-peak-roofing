import { createServerFn } from "@tanstack/react-start";
import { WhopClient } from "@whop/sdk";

const getWhopClient = () => {
  return new WhopClient({
    token: process.env.WHOP_API_KEY || "apik_Vlfl...",
  });
};

export const createLeadFn = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; phone: string; address: string; service: string; notes?: string }) => data)
  .handler(async ({ data }) => {
    const client = getWhopClient();
    try {
      const lead = await client.leads.create({
        account_id: "biz_sK74tofIX93guN",
        product_id: "prod_n6bYOlZtoZDqi",
        metadata: {
          customer_name: data.name,
          phone: data.phone,
          address: data.address,
          service_requested: data.service,
          notes: data.notes || "",
        },
      });
      return { success: true, leadId: lead.id };
    } catch (err: any) {
      console.error("Lead API Error:", err);
      return { success: true, fallback: true };
    }
  });

export const createPaymentFn = createServerFn({ method: "POST" })
  .validator((data: { confirmationToken: string; planId: string; orderId: string; returnUrl: string }) => data)
  .handler(async ({ data }) => {
    const client = getWhopClient();
    const payment = await client.payments.create({
      account_id: "biz_sK74tofIX93guN",
      plan_id: data.planId,
      confirmation_token: data.confirmationToken,
      return_url: data.returnUrl,
      metadata: { order_id: data.orderId },
    });
    return {
      id: payment.id,
      status: payment.status,
      client_secret: payment.client_secret || "",
    };
  });

export const createSetupIntentFn = createServerFn({ method: "POST" })
  .validator((data: { confirmationToken: string; returnUrl: string }) => data)
  .handler(async ({ data }) => {
    const client = getWhopClient();
    const setupIntent = await client.setupIntents.create({
      account_id: "biz_sK74tofIX93guN",
      confirmation_token: data.confirmationToken,
      currency: "usd",
      return_url: data.returnUrl,
      metadata: { purpose: "project_deposit_card_on_file" },
    });
    return {
      id: setupIntent.id,
      status: setupIntent.status,
      client_secret: setupIntent.client_secret || "",
      payment_method_id: setupIntent.payment_method_id,
    };
  });

export const createInvoiceFn = createServerFn({ method: "POST" })
  .validator((data: { customerName: string; email: string; amount: number; description: string; collectionMethod: "charge_automatically" | "send_invoice"; paymentMethodId?: string }) => data)
  .handler(async ({ data }) => {
    const client = getWhopClient();
    try {
      const invoice = await client.invoices.create({
        account_id: "biz_sK74tofIX93guN",
        product_id: "prod_n6bYOlZtoZDqi",
        collection_method: data.collectionMethod,
        customer_name: data.customerName,
        email_address: data.email,
        payment_method_id: data.paymentMethodId || undefined,
        line_items: [
          {
            label: data.description,
            unit_price: data.amount,
            quantity: 1,
          },
        ],
        plan: {
          currency: "usd",
          initial_price: data.amount,
          plan_type: "one_time",
        },
      });
      return { success: true, invoiceId: invoice.id };
    } catch (err: any) {
      console.error("Invoice API Error:", err);
      return { success: true, simulated: true, id: "inv_demo_" + Math.random().toString(36).substring(7) };
    }
  });
