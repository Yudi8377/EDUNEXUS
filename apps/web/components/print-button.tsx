"use client";

export default function PrintButton({ label = "Cetak" }: { label?: string }) {
  return (
    <button type="button" className="print-button" onClick={() => window.print()}>
      {label}
    </button>
  );
}
