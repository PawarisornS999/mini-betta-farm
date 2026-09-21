import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { supabaseRest } from "@/lib/supabase/rest";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 10 * 1024 * 1024;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ";
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "กรุณาเลือกไฟล์รูปภาพ" }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ success: false, message: "รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP" }, { status: 400 });
    }
    if (file.size > maxFileSize) {
      return NextResponse.json({ success: false, message: "รูปภาพต้องมีขนาดไม่เกิน 10 MB" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ success: false, message: "Supabase is not configured" }, { status: 500 });
    }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
    const path = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
    const upload = await fetch(`${url}/storage/v1/object/product-media/${path}`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": file.type,
        "cache-control": "public, max-age=31536000, immutable",
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
    });
    if (!upload.ok) {
      const details = await upload.text();
      throw new Error(details || `Supabase Storage upload failed (${upload.status})`);
    }

    const publicUrl = `${url}/storage/v1/object/public/product-media/${path}`;
    await supabaseRest("media_assets", {
      method: "POST",
      serviceRole: true,
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ file_name: file.name, storage_path: path, public_url: publicUrl, mime_type: file.type, file_size: file.size }),
    });
    return NextResponse.json({ success: true, data: { url: publicUrl } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: errorMessage(error) }, { status: 500 });
  }
}
