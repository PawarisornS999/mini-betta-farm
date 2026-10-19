import Link from "next/link";
export default function ForbiddenPage() { return <div className="rounded-2xl bg-white p-8"><h2 className="text-xl font-bold">ไม่มีสิทธิ์เข้าถึงหน้านี้</h2><p className="mt-2 text-sm text-[#77776f]">กรุณาติดต่อ Owner หากต้องการสิทธิ์เพิ่มเติม</p><Link className="mt-5 inline-block underline" href="/admin">กลับหน้าภาพรวม</Link></div>; }
