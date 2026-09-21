import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { supabaseRest } from "@/lib/supabase/rest";

type Settings = { payment_bank: string | null; payment_account_name: string | null; payment_account_number: string | null; payment_promptpay_number: string | null; shipping_fee: number | string };

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const rows = await supabaseRest<Settings[]>("store_settings?id=eq.default&select=payment_bank,payment_account_name,payment_account_number,payment_promptpay_number,shipping_fee", { serviceRole: true, cache: "no-store" });
  return NextResponse.json({ data: rows[0] || null });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { bank?: string; accountName?: string; accountNumber?: string; promptpayNumber?: string };
  const bank = body.bank?.trim() || "";
  const accountName = body.accountName?.trim() || "";
  const accountNumber = body.accountNumber?.trim() || "";
  const promptpayNumber = body.promptpayNumber?.trim() || "";
  if (!accountName || !(accountNumber || promptpayNumber) || (accountNumber && (!bank || !/^[0-9-]{8,20}$/.test(accountNumber))) || (promptpayNumber && !/^[0-9]{10,13}$/.test(promptpayNumber))) {
    return NextResponse.json({ message: "กรุณากรอกชื่อผู้รับและเลขบัญชีหรือ PromptPay ให้ถูกต้อง" }, { status: 400 });
  }
  await supabaseRest("store_settings?id=eq.default", {
    method: "PATCH", serviceRole: true, headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ payment_bank: bank || null, payment_account_name: accountName, payment_account_number: accountNumber || null, payment_promptpay_number: promptpayNumber || null }),
  });
  try {
    await supabaseRest("activity_logs", { method: "POST", serviceRole: true, headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ admin_name: session.username, action: "payment_settings.update", resource_type: "store_settings", resource_id: "default", details: { bank, accountNumberLast4: accountNumber.slice(-4), promptpayLast4: promptpayNumber.slice(-4) } }),
    });
  } catch (error) { console.error("Payment settings audit log failed", error); }
  return NextResponse.json({ success: true });
}
