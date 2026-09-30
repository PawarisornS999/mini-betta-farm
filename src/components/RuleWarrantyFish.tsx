export function RuleWarrantyFish() {
  return (
    <div className="mt-2 mx-auto w-full max-w-[540px] rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <h3 className="text-lg font-semibold mb-2">เงื่อนไขการเคลมปลา</h3>
      <ul className="list-disc list-inside text-sm text-muted space-y-1">
        <li><span className="font-medium">ส่งรูปภาพหรือวิดีโอของปลาที่ได้รับมาให้ทางร้าน</span> : เริ่มถ่ายตั้งแต่เปิดกล่อง เห็นถุงปลาอย่างชัดเจน</li>
        <li><span className="font-medium">รับประกันปลาตายจากการขนส่งเท่านั้น</span> : ไม่ครอบคลุมกรณีตายจากการเลี้ยงหลังรับปลา</li>
        <li><span className="font-medium">ร้านจะพิจารณาและติดต่อกลับภายใน 48 ชั่วโมง</span></li>
        <li><span className="font-medium">หากพบว่าปลามีปัญหาจริง</span> ทางร้านจะจัดส่งปลาใหม่ให้ฟรี</li>
        <li><span className="font-medium">การเคลมไม่ครอบคลุมความเสียหายที่เกิดจากการดูแลของลูกค้าเอง</span></li>
        <li><span className="font-medium">ปลาต้องอยู่ในถุง ยังไม่เปิดถุง</span></li>
        <li><span className="font-medium">แจ้งเคลมทันทีหลังเซ็นรับพัสดุ</span></li>
      </ul>
    </div>
  );
}