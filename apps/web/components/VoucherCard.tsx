"use client";

import { useState } from "react";
import type { VoucherPayload } from "@/lib/types";

export function VoucherCard({ voucher }: { voucher: VoucherPayload }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="mb-3 text-sm font-semibold text-emerald-800">Your voucher</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-500">Code</dt>
          <div className="flex items-center gap-2">
            <dd className="font-mono font-medium">{voucher.code}</dd>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded border border-gray-300 px-2 py-0.5 text-xs hover:bg-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        {voucher.pin && (
          <div className="flex justify-between">
            <dt className="text-gray-500">PIN</dt>
            <dd className="font-mono">{voucher.pin}</dd>
          </div>
        )}
        {voucher.serialNumber && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Serial</dt>
            <dd className="font-mono">{voucher.serialNumber}</dd>
          </div>
        )}
        {voucher.expiryDate && (
          <div className="flex justify-between">
            <dt className="text-gray-500">Expires</dt>
            <dd>{new Date(voucher.expiryDate).toLocaleDateString()}</dd>
          </div>
        )}
        {voucher.activationInstructions && (
          <div>
            <dt className="text-gray-500">Activation</dt>
            <dd className="mt-1 text-gray-700">{voucher.activationInstructions}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-gray-500">Verified</dt>
          <dd>{voucher.validated ? "Yes" : "Pending verification"}</dd>
        </div>
      </dl>
    </div>
  );
}
