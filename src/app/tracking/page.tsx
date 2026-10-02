"use client";

import { FormEvent, useEffect, useState } from "react";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faCircleCheck, faLocationDot, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { ThailandPostEvent } from "@/lib/thailand-post";

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [events, setEvents] = useState<ThailandPostEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function track(number: string) {
    const normalized = number.trim().toUpperCase();
    if (!normalized) return;
    setLoading(true);
    setError("");
    setSearched(true);
    setEvents([]);
    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: normalized }),
      });
      const body = (await response.json()) as {
        message?: string;
        data?: { events?: ThailandPostEvent[] };
      };
      if (!response.ok) throw new Error(body.message || "ติดตามพัสดุไม่สำเร็จ");
      setEvents(body.data?.events ?? []);
      window.history.replaceState(null, "", `/tracking?number=${encodeURIComponent(normalized)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ติดตามพัสดุไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const number = new URLSearchParams(window.location.search).get("number")?.trim().toUpperCase();
    if (number) {
      setTrackingNumber(number);
      void track(number);
    }
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void track(trackingNumber);
  }

  const orderedEvents = [...events].reverse();

  return (
    <>
      <Header />
      <main className="min-h-[75vh] bg-slate-50 px-4 pb-20 pt-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-600 text-2xl text-white shadow-lg shadow-red-200">
              <FontAwesomeIcon icon={faBox} />
            </span>
            <h1 className="mt-5 text-3xl font-bold text-slate-900">ติดตามพัสดุ</h1>
            <p className="mt-2 text-sm text-slate-500">ตรวจสอบสถานะล่าสุดจากระบบไปรษณีย์ไทย</p>
          </div>

          <form onSubmit={submit} className="mt-8 flex gap-2 rounded-2xl bg-white p-3 shadow-sm">
            <input
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value.toUpperCase())}
              maxLength={13}
              placeholder="กรอกหมายเลขพัสดุ 13 หลัก"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 font-mono uppercase outline-none focus:border-red-500"
            />
            <button
              disabled={loading || !trackingNumber.trim()}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
              {loading ? "กำลังค้นหา" : "ติดตาม"}
            </button>
          </form>

          {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

          {!loading && searched && !error && !events.length && (
            <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-slate-700">ยังไม่พบข้อมูลพัสดุหมายเลขนี้</p>
              <p className="mt-2 text-sm text-slate-500">โปรดตรวจสอบหมายเลข หรือลองใหม่หลังจากไปรษณีย์รับฝากพัสดุแล้ว</p>
            </div>
          )}

          {orderedEvents.length > 0 && (
            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs text-slate-500">หมายเลขพัสดุ</p>
                  <p className="mt-1 font-mono font-bold text-slate-900">{trackingNumber}</p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">{orderedEvents[0].statusDescription}</span>
              </div>
              <div className="space-y-0">
                {orderedEvents.map((item, index) => (
                  <div key={`${item.status}-${item.statusDate}-${index}`} className="relative flex gap-4 pb-7 last:pb-0">
                    {index < orderedEvents.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-200" />}
                    <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      <FontAwesomeIcon icon={index === 0 ? faCircleCheck : faLocationDot} className="text-xs" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800">{item.statusDescription}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.location}{item.postcode ? ` ${item.postcode}` : ""}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.statusDate}</p>
                      {item.deliveryDescription && <p className="mt-2 text-sm text-green-700">{item.deliveryDescription}{item.receiverName ? ` · ${item.receiverName}` : ""}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
