"use client";

import { useState } from "react";
import { Ticket, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import {
  getAdminVouchers,
  createAdminVoucher,
  updateAdminVoucher,
  deleteAdminVoucher,
  getApiErrorMessage,
  AdminVoucher,
  AdminVoucherInput,
} from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getVoucherStatus(v: AdminVoucher): { label: string; color: string; bg: string } {
  if (!v.isActive) return { label: "Inactive", color: "text-[#F7F7F7]/40", bg: "bg-white/[0.06]" };
  if (new Date(v.validUntil).getTime() < Date.now()) return { label: "Expired", color: "text-orange-400", bg: "bg-orange-400/10" };
  if (v.usedCount >= v.usageLimit) return { label: "Exhausted", color: "text-red-400", bg: "bg-red-400/10" };
  return { label: "Active", color: "text-green-400", bg: "bg-green-400/10" };
}

export default function AdminVouchersPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminVoucher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminVoucher | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: vouchers = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.vouchers(),
    queryFn: getAdminVouchers,
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.vouchers() });
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: AdminVoucherInput }) =>
      id ? updateAdminVoucher(id, input) : createAdminVoucher(input),
    onSuccess: (_data, vars) => {
      invalidate();
      setIsFormOpen(false);
      setEditing(null);
      showToast(vars.id ? "Voucher updated." : "Voucher created.");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminVoucher(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      showToast("Voucher deleted.");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
  });

  function openCreate() {
    setEditing(null);
    setIsFormOpen(true);
  }

  function openEdit(v: AdminVoucher) {
    setEditing(v);
    setIsFormOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="caption text-[#E6FA50]">Marketplace Admin</p>
          <h1 className="heading-1 mt-2 text-[#F7F7F7]">
            Voucher <span className="text-[#E6FA50]">Management</span>
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="btn-lime label flex h-10 shrink-0 items-center gap-2 rounded-full px-5 uppercase"
        >
          <Plus className="h-4 w-4" /> New Voucher
        </button>
      </div>

      <div className="flex flex-1 flex-col space-y-4">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </>
        ) : isError ? (
          <ErrorBanner title="Couldn't load vouchers" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
        ) : vouchers.length === 0 ? (
          <EmptyState icon={Ticket} title="No vouchers yet" description="Create your first promo voucher to get started." actionLabel="New Voucher" onAction={openCreate} />
        ) : (
          vouchers.map((v) => {
            const status = getVoucherStatus(v);
            return (
              <div key={v.id} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="heading-2 font-mono tracking-wide text-[#F7F7F7]">{v.code}</h3>
                      {status && (
                        <span className={`caption uppercase ${status.color}`}>{status.label}</span>
                      )}
                    </div>
                    <p className="body-sm mt-2 text-[#F7F7F7]/60">
                      {v.type === "PERCENTAGE" ? `${v.value}% off` : `${formatIDR(v.value)} off`}
                      {v.minPurchase != null && ` · min ${formatIDR(v.minPurchase)}`}
                      {v.type === "PERCENTAGE" && v.maxDiscount != null && ` · max ${formatIDR(v.maxDiscount)}`}
                    </p>
                    <p className="mt-1 caption text-[#F7F7F7]/25">
                      {formatDate(v.validFrom)} – {formatDate(v.validUntil)} · Used {v.usedCount}/{v.usageLimit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(v)}
                      className="label flex h-9 items-center gap-1.5 rounded-full border border-white/[0.1] px-4 uppercase text-[#F7F7F7]/70 transition-colors hover:border-white/[0.2] hover:text-[#F7F7F7]"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(v)}
                      className="label flex h-9 items-center gap-1.5 rounded-full border border-red-500/40 px-4 uppercase text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isFormOpen && (
        <VoucherFormModal
          voucher={editing}
          isSaving={saveMutation.isPending}
          onClose={() => { setIsFormOpen(false); setEditing(null); }}
          onSubmit={(input) => saveMutation.mutate({ id: editing?.id, input })}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
            <p className="section-label">Delete Voucher</p>
            <h2 className="heading-2 mt-3 text-[#F7F7F7]">Delete {deleteTarget.code}?</h2>
            <p className="body-sm mt-2 text-[#F7F7F7]/40">
              This permanently removes the voucher. If it has already been used on bookings, the server will block deletion — deactivate it instead by editing and turning off &quot;Active&quot;.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="label rounded-full border border-white/[0.08] px-5 py-2.5 uppercase text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="label rounded-full bg-red-500/15 px-5 py-2.5 uppercase text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
          <p className="body-sm text-[#F7F7F7]/60">{toast}</p>
        </div>
      )}
    </div>
  );
}

function VoucherFormModal({
  voucher,
  isSaving,
  onClose,
  onSubmit,
}: {
  voucher: AdminVoucher | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: AdminVoucherInput) => void;
}) {
  const [code, setCode] = useState(voucher?.code ?? "");
  const [type, setType] = useState<"NOMINAL" | "PERCENTAGE">(voucher?.type ?? "NOMINAL");
  const [value, setValue] = useState(voucher ? String(voucher.value) : "");
  const [usageLimit, setUsageLimit] = useState(voucher ? String(voucher.usageLimit) : "");
  const [minPurchase, setMinPurchase] = useState(voucher?.minPurchase != null ? String(voucher.minPurchase) : "");
  const [maxDiscount, setMaxDiscount] = useState(voucher?.maxDiscount != null ? String(voucher.maxDiscount) : "");
  const [validFrom, setValidFrom] = useState(voucher ? voucher.validFrom.slice(0, 10) : "");
  const [validUntil, setValidUntil] = useState(voucher ? voucher.validUntil.slice(0, 10) : "");
  const [isActive, setIsActive] = useState(voucher?.isActive ?? true);

  const canSubmit = code.trim() !== "" && value !== "" && usageLimit !== "" && validFrom !== "" && validUntil !== "" && !isSaving;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      usageLimit: Number(usageLimit),
      minPurchase: minPurchase === "" ? null : Number(minPurchase),
      maxDiscount: maxDiscount === "" ? null : Number(maxDiscount),
      validFrom: new Date(`${validFrom}T00:00:00`).toISOString(),
      validUntil: new Date(`${validUntil}T23:59:59`).toISOString(),
      isActive,
    });
  }

  const inputClass = "body w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#50C8C8]/40 focus:outline-none";
  const labelClass = "mb-1.5 block caption text-[#F7F7F7]/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="section-label">{voucher ? "Edit Voucher" : "New Voucher"}</p>
          <button onClick={onClose} className="text-[#F7F7F7]/40 hover:text-[#F7F7F7]"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME20" className={`${inputClass} font-mono uppercase`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "NOMINAL" | "PERCENTAGE")} className={inputClass}>
                <option value="NOMINAL">Nominal (IDR)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{type === "PERCENTAGE" ? "Value (%)" : "Value (IDR)"}</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Purchase (optional)</label>
              <input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} placeholder="—" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Discount (optional)</label>
              <input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="—" disabled={type !== "PERCENTAGE"} className={`${inputClass} disabled:opacity-40`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Usage Limit</label>
            <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Valid From</label>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valid Until</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClass} />
            </div>
          </div>
          <label className="label flex items-center gap-2.5 text-[#F7F7F7]/60">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent" />
            Active
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} disabled={isSaving} className="label rounded-full border border-white/[0.08] px-5 py-2.5 uppercase text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit} className="btn-lime label flex items-center justify-center gap-2 rounded-full px-5 py-2.5 uppercase disabled:opacity-40">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : voucher ? "Save Changes" : "Create Voucher"}
          </button>
        </div>
      </div>
    </div>
  );
}
