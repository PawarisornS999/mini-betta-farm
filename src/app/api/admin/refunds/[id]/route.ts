import { NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import { supabaseRest } from "@/lib/supabase/rest";
import { pushLineMessage } from "@/lib/line/messaging";

const labels = {
  reviewing: "กำลังตรวจสอบและดำเนินการคืนเงิน",
  refunded: "คืนเงินแล้ว กรุณาตรวจสอบบัญชีของคุณ",
  rejected: "คำร้องไม่ผ่านการตรวจสอบ กรุณาติดต่อร้านเพื่อสอบถามรายละเอียด",
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "refunds.manage")) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json() as { status?: string; adminNote?: string };
    if (!body.status || !Object.hasOwn(labels, body.status) || (body.adminNote !== undefined && typeof body.adminNote !== "string") || (body.adminNote?.length ?? 0) > 1000) {
      return NextResponse.json({ message: "Invalid refund update" }, { status: 400 });
    }
    if (body.status === "rejected" && !body.adminNote?.trim()) {
      return NextResponse.json({ message: "กรุณาระบุเหตุผลที่ไม่อนุมัติ" }, { status: 400 });
    }
    const refund = await supabaseRest<{ line_user_id: string; status: keyof typeof labels }>("rpc/admin_update_refund", {
      method: "POST",
      serviceRole: true,
      body: JSON.stringify({ p_refund_id: id, p_status: body.status, p_admin_note: body.adminNote ?? null }),
    });
    if (refund.line_user_id && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
        await pushLineMessage(refund.line_user_id, `💰 คำร้องคืนเงิน #${id.slice(0, 8).toUpperCase()}: ${labels[refund.status]}${body.adminNote?.trim() ? `\nรายละเอียด: ${body.adminNote.trim()}` : ""}\nติดตามสถานะ: ${siteUrl}/refunds`);
      } catch (error) { console.error("Refund status notice failed", error); }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "อัปเดตสถานะคืนเงินไม่สำเร็จ" }, { status: 409 });
  }
}
