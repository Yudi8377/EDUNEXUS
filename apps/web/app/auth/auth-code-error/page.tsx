import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="eyebrow">AUTENTIKASI EDUNEXUS</div>
        <h1>Proses masuk belum selesai.</h1>
        <p>Tautan autentikasi tidak dapat diproses atau sudah kedaluwarsa. Silakan mulai kembali dari halaman masuk EDUNEXUS.</p>
        <Link href="/auth/login" className="secondary">← Kembali ke Masuk</Link>
      </section>
    </main>
  );
}
