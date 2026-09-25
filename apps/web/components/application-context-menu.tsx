"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { code: string };

export default function ApplicationContextMenu({ code }: Props) {
  const [open, setOpen] = useState(false);
  const items = [
    { href: `/applications/${code}/workflow`, label: "Alur kerja", icon: "↗", hint: "Lihat proses kerja aplikasi" },
    { href: `/applications/${code}/documents`, label: "Dokumen", icon: "▤", hint: "Dokumen dan cetak" },
    { href: `/applications/${code}/access`, label: "Hak akses", icon: "◈", hint: "Lihat akses aplikasi" },
  ];

  return (
    <div
      className="nx-context-tools"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="nx-context-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Buka alat tambahan aplikasi"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">•••</span>
        <small>Lainnya</small>
      </button>
      {open && (
        <div className="nx-context-popover" role="menu" aria-label="Alat tambahan aplikasi">
          <span className="nx-context-popover-label">Alat aplikasi</span>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="nx-context-item"
              onClick={() => setOpen(false)}
            >
              <span>{item.icon}</span>
              <span><b>{item.label}</b><small>{item.hint}</small></span>
              <strong>→</strong>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
