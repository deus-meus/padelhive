"use client";

import { useState } from "react";
import { Percent, Save, RotateCcw } from "lucide-react";
import { commissionSettings } from "@/mock/admin";

export default function CommissionPage() {
  const [defaultCommission, setDefaultCommission] = useState(commissionSettings.defaultCommission);
  const [perVenue, setPerVenue] = useState(commissionSettings.perVenue.map((v) => ({ ...v })));
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleSaveDefault() {
    showToast("Coming soon in backend integration.");
  }

  function handleSaveVenue(_venueId: string) {
    showToast("Coming soon in backend integration.");
  }

  function handleReset() {
    setDefaultCommission(commissionSettings.defaultCommission);
    setPerVenue(commissionSettings.perVenue.map((v) => ({ ...v })));
    showToast("Reset to defaults");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/30">Settings</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Commission <span className="text-[#E6FA50]">Settings</span>
        </h1>
      </div>

      {/* Default Commission */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FA50]/10">
            <Percent className="h-4 w-4 text-[#E6FA50]" />
          </div>
          <div>
            <p className="heading-3 text-sm text-[#F7F7F7]">Default Commission Rate</p>
            <p className="caption text-[#F7F7F7]/25">Applied to all venues unless overridden</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="number"
              min={0}
              max={50}
              value={defaultCommission}
              onChange={(e) => setDefaultCommission(Number(e.target.value))}
              className="w-24 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-center text-lg font-semibold text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#F7F7F7]/30">%</span>
          </div>
          <button
            onClick={handleSaveDefault}
            className="btn-lime flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
          <button
            onClick={handleReset}
            className="btn-outline-white flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Per-Venue Overrides */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <div className="mb-5">
          <p className="heading-3 text-sm text-[#F7F7F7]">Per-Venue Commission Override</p>
          <p className="caption text-[#F7F7F7]/25 mt-1">Set custom commission rates for specific venues</p>
        </div>

        <div className="space-y-3">
          {perVenue.map((venue, idx) => (
            <div key={venue.venueId} className="flex flex-col gap-3 rounded-xl bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#F7F7F7]/80">{venue.venueName}</p>
                <p className="caption text-[#F7F7F7]/25">{venue.city}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={venue.commission}
                    onChange={(e) => {
                      const updated = [...perVenue];
                      updated[idx] = { ...updated[idx], commission: Number(e.target.value) };
                      setPerVenue(updated);
                    }}
                    className="w-20 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-center text-sm font-medium text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#F7F7F7]/30">%</span>
                </div>
                {venue.commission !== commissionSettings.perVenue[idx]?.commission && (
                  <span className="text-[10px] text-amber-400">modified</span>
                )}
                <button
                  onClick={() => handleSaveVenue(venue.venueId)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6FA50]/10 text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20"
                  title="Save"
                >
                  <Save className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/70">{toast}</p>
        </div>
      )}
    </div>
  );
}
