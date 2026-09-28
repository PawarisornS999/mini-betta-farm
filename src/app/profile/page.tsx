/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import BaseDropdown from "@/components/BaseDropdown";
import { useLangStore } from "@/store/lang";
import type { CustomerProfile, CustomerProfileInput } from "@/types";
import { searchAddressByProvince } from "thai-address-database";

const thaiAddresses = searchAddressByProvince(".", 10000);

function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort((first, second) => first.localeCompare(second, "th"));
}

const emptyProfile: CustomerProfile = {
  displayName: "",
  customerName: "",
  customerPhone: "",
  addressDetails: "",
  province: "",
  district: "",
  subdistrict: "",
  postalCode: "",
};

export default function ProfilePage() {
  const lang = useLangStore((state) => state.lang);
  const text = (th: string, en: string) => lang === "th" ? th : en;
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const provinces = useMemo(() => uniqueValues(thaiAddresses.map((item) => item.province)), []);
  const districts = useMemo(() => uniqueValues(thaiAddresses.filter((item) => item.province === profile.province).map((item) => item.amphoe)), [profile.province]);
  const subdistricts = useMemo(() => uniqueValues(thaiAddresses.filter((item) => item.province === profile.province && item.amphoe === profile.district).map((item) => item.district)), [profile.province, profile.district]);

  useEffect(() => {
    let active = true;
    fetch("/api/customer/profile", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          const lineResult = new URLSearchParams(window.location.search).get("line");
          if (lineResult) {
            const messages: Record<string, string> = {
              "access-denied": "คุณยกเลิกการเข้าสู่ระบบ LINE / LINE Login was cancelled",
              "friend-required": "กรุณาเพิ่มร้านเป็นเพื่อนใน LINE OA แล้วลองอีกครั้ง / Please add the store's LINE OA as a friend and try again",
              "invalid-state": "คำขอเข้าสู่ระบบหมดอายุ กรุณาลองใหม่ / The login request expired. Please try again",
              "login-failed": "เข้าสู่ระบบ LINE ไม่สำเร็จ กรุณาลองใหม่ / LINE Login failed. Please try again",
            };
            setLoginRequired(true);
            setError(messages[lineResult] || messages["login-failed"]);
            return null;
          }
          window.location.assign("/api/line/login?returnTo=/profile");
          return null;
        }
        const body = await response.json() as { data?: CustomerProfile; message?: string };
        if (!response.ok || !body.data) throw new Error(body.message || "Unable to load profile");
        return body.data;
      })
      .then((data) => { if (active && data) setProfile(data); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "โหลดโปรไฟล์ไม่สำเร็จ / Unable to load profile"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function update<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const input: CustomerProfileInput = {
      customerName: profile.customerName,
      customerPhone: profile.customerPhone,
      addressDetails: profile.addressDetails,
      province: profile.province,
      district: profile.district,
      subdistrict: profile.subdistrict,
      postalCode: profile.postalCode,
    };
    try {
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await response.json() as { data?: CustomerProfile; message?: string };
      if (!response.ok || !body.data) throw new Error(body.message || text("บันทึกไม่สำเร็จ", "Unable to save profile"));
      setProfile(body.data);
      setMessage(text("บันทึกข้อมูลเรียบร้อยแล้ว", "Profile saved successfully"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text("บันทึกไม่สำเร็จ", "Unable to save profile"));
    } finally {
      setSaving(false);
    }
  }

  return <><Header /><main className="mx-auto min-h-[70vh] max-w-3xl px-4 pb-20 pt-28 text-foreground">
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-4 border-b border-black/5 pb-6">
        {profile.pictureUrl ? <img src={profile.pictureUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-2xl">👤</div>}
        <div><p className="text-sm text-muted">LINE</p><h1 className="text-2xl font-bold">{profile.displayName || text("โปรไฟล์ลูกค้า", "Customer profile")}</h1><p className="mt-1 text-sm text-muted">{text("ข้อมูลนี้จะถูกใช้เติมในหน้า Checkout อัตโนมัติ", "This information will automatically fill your checkout form")}</p></div>
      </div>
      {loading ? <p className="py-12 text-center text-muted">{text("กำลังโหลดโปรไฟล์...", "Loading profile...")}</p> : loginRequired ? <div className="py-10 text-center">
        <p role="alert" className="mb-5 text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => window.location.assign("/api/line/login?returnTo=/profile")} className="rounded-2xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700">{text("เข้าสู่ระบบ LINE อีกครั้ง", "Try LINE Login again")}</button>
      </div> : <div className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={text("ชื่อผู้รับ *", "Recipient name *")}><input value={profile.customerName} onChange={(event) => update("customerName", event.target.value)} className="input-admin" /></Field>
          <Field label={text("เบอร์โทรศัพท์ *", "Phone number *")}><input type="tel" value={profile.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} className="input-admin" /></Field>
        </div>
        <Field label={text("บ้านเลขที่ ถนน ซอย", "House number, road, building")}><textarea rows={3} value={profile.addressDetails} onChange={(event) => update("addressDetails", event.target.value)} className="input-admin resize-none" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={text("จังหวัด *", "Province *")}><BaseDropdown value={profile.province} onChange={(value) => setProfile((current) => ({ ...current, province: value, district: "", subdistrict: "", postalCode: "" }))} placeholder={text("เลือกจังหวัด", "Select province")} options={provinces.map((value) => ({ value, label: value }))} /></Field>
          <Field label={text("อำเภอ/เขต *", "District *")}><BaseDropdown value={profile.district} disabled={!profile.province} onChange={(value) => setProfile((current) => ({ ...current, district: value, subdistrict: "", postalCode: "" }))} placeholder={text("เลือกอำเภอ/เขต", "Select district")} options={districts.map((value) => ({ value, label: value }))} /></Field>
          <Field label={text("ตำบล/แขวง *", "Subdistrict *")}><BaseDropdown value={profile.subdistrict} disabled={!profile.district} onChange={(value) => setProfile((current) => ({ ...current, subdistrict: value, postalCode: thaiAddresses.find((item) => item.province === current.province && item.amphoe === current.district && item.district === value)?.zipcode ?? "" }))} placeholder={text("เลือกตำบล/แขวง", "Select subdistrict")} options={subdistricts.map((value) => ({ value, label: value }))} /></Field>
          <Field label={text("รหัสไปรษณีย์ *", "Postal code *")}><input inputMode="numeric" maxLength={5} value={profile.postalCode} onChange={(event) => update("postalCode", event.target.value.replace(/\D/g, ""))} className="input-admin" /></Field>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</p>}
        <button type="button" disabled={saving} onClick={() => void save()} className="w-full rounded-2xl bg-green-600 px-6 py-3.5 font-bold text-white hover:bg-green-700 disabled:opacity-50">{saving ? text("กำลังบันทึก...", "Saving...") : text("บันทึกโปรไฟล์และที่อยู่", "Save profile and address")}</button>
      </div>}
    </div>
  </main><Footer /></>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>;
}
