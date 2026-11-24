# Phase 03 — Goal & Pathway Engine Implementation v1

## Purpose
Mengubah tujuan learner menjadi target kompetensi dan rekomendasi pathway yang dapat diaudit.

## Core flow
Goal → Baseline → Competency Targets → Stages → Activities/Projects → Evidence → Review → Next Step.

## Guardrails
- Goal tidak boleh diubah AI menjadi janji hasil kompetisi, pekerjaan, gelar, atau seleksi.
- Rekomendasi harus dapat dijelaskan.
- Learner dan mentor dapat mengoreksi rekomendasi.
- Baseline yang belum diverifikasi tidak diperlakukan sebagai kompetensi terbukti.
- Riwayat pathway harus versioned; perubahan tidak boleh merusak evidence lama.

## Public Personality / Pageant
Platform dapat membantu public speaking, interview, presentation, language, portfolio, social-impact project, dan personal development. Platform tidak memberi prediksi atau jaminan kemenangan, seleksi, ranking, atau title.

## Next
Persistence goal/pathway, RLS tenant boundaries, assessment/evidence linkage, adaptive pathway versioning.
