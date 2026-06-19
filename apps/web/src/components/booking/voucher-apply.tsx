"use client";

import { useState } from "react";
import { Ticket, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { mockVouchers } from "@/mock/vouchers";

export type VoucherResult = {
  valid: boolean;
  code: string;
  discount: number;
  message: string;
};

export function VoucherApply({
  orderAmount,
  onApply,
  onRemove,
}: {
  orderAmount: number;
  onApply: (result: VoucherResult) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoucherResult | null>(null);

  function validateVoucher() {
    if (!code.trim()) return;

    setLoading(true);

    setTimeout(() => {
      const voucher = mockVouchers.find(
        (v) => v.code.toLowerCase() === code.trim().toLowerCase()
      );

      let validationResult: VoucherResult;

      if (!voucher) {
        validationResult = { valid: false, code: code.trim(), discount: 0, message: "Invalid voucher code" };
      } else if (!voucher.isActive) {
        validationResult = { valid: false, code: voucher.code, discount: 0, message: "This voucher has expired" };
      } else if (voucher.usedCount >= voucher.usageLimit) {
        validationResult = { valid: false, code: voucher.code, discount: 0, message: "Voucher usage limit reached" };
      } else if (voucher.minPurchase && orderAmount < voucher.minPurchase) {
        validationResult = {
          valid: false,
          code: voucher.code,
          discount: 0,
          message: `Minimum spend Rp ${(voucher.minPurchase / 1000).toFixed(0)}K required`,
        };
      } else {
        let discount: number;
        if (voucher.type === "percentage") {
          discount = Math.round(orderAmount * (voucher.value / 100));
          if (voucher.maxDiscount && discount > voucher.maxDiscount) {
            discount = voucher.maxDiscount;
          }
        } else {
          discount = voucher.value;
        }
        validationResult = {
          valid: true,
          code: voucher.code,
          discount,
          message: `${voucher.type === "percentage" ? `${voucher.value}%` : `Rp ${(voucher.value / 1000).toFixed(0)}K`} discount applied`,
        };
      }

      setResult(validationResult);
      setLoading(false);
      if (validationResult.valid) {
        onApply(validationResult);
      }
    }, 800);
  }

  function handleRemove() {
    setResult(null);
    setCode("");
    onRemove();
  }

  if (result?.valid) {
    return (
      <div className="rounded-xl border border-[#E6FA50]/10 bg-[#E6FA50]/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-[#E6FA50]" />
            <div>
              <p className="label text-[#E6FA50]">{result.code}</p>
              <p className="caption text-[#E6FA50]/60">{result.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="price text-[#E6FA50]">
              -Rp {(result.discount / 1000).toFixed(0)}K
            </span>
            <button
              onClick={handleRemove}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#F7F7F7]/25 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]/60"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25" />
          <input
            type="text"
            placeholder="Enter voucher code"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") validateVoucher(); }}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 body text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
          />
        </div>
        <button
          onClick={validateVoucher}
          disabled={!code.trim() || loading}
          className="btn-lime flex items-center gap-2 rounded-xl px-5 py-2.5 label disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {result && !result.valid && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/5 px-3 py-2">
          <XCircle className="h-3.5 w-3.5 text-red-400" />
          <span className="caption text-red-400">{result.message}</span>
        </div>
      )}
    </div>
  );
}
