import type { CompetencyDomain, MasteryLevel } from "./talent-skill";

export type SafetyClass = "standard" | "minor_safe" | "high_impact_review";

export interface CompetencyRubricBand {
  level: MasteryLevel;
  label: string;
  observable: string[];
}

export interface CompetencyDefinition {
  id: string;
  version: number;
  domain: CompetencyDomain;
  subdomain: string;
  title: string;
  description: string;
  ageBands: Array<"SMP" | "SMA_SMK" | "UNIVERSITY" | "PROFESSIONAL">;
  observableIndicators: string[];
  evidenceTypes: string[];
  rubric: CompetencyRubricBand[];
  safetyClass: SafetyClass;
  active: boolean;
}

export const MASTERY_LEVELS: MasteryLevel[] = [
  "Explore",
  "Foundation",
  "Developing",
  "Proficient",
  "Advanced",
  "Applied/Portfolio",
];

const rubric = (
  labels: Array<[MasteryLevel, string, string[]]>,
): CompetencyRubricBand[] =>
  labels.map(([level, label, observable]) => ({ level, label, observable }));

export const COMPETENCY_CATALOG_V1: CompetencyDefinition[] = [
  {
    id: "CHAR-01",
    version: 1,
    domain: "Character",
    subdomain: "Self-management",
    title: "Discipline & follow-through",
    description: "Menyelesaikan komitmen belajar secara konsisten dan melakukan refleksi ketika target tidak tercapai.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["menyusun komitmen", "mengikuti jadwal", "menyelesaikan tugas", "melakukan refleksi"],
    evidenceTypes: ["reflection", "mentor_review", "project"],
    rubric: rubric([
      ["Explore", "Mulai mengenali kebiasaan", ["dapat menyebutkan hambatan pribadi"]],
      ["Foundation", "Mengikuti rencana sederhana", ["menyelesaikan tugas dengan pengingat"]],
      ["Developing", "Mulai konsisten", ["menjaga komitmen pada beberapa siklus"]],
      ["Proficient", "Mandiri dan konsisten", ["menyesuaikan rencana tanpa menghilangkan target"]],
      ["Advanced", "Mampu mengelola prioritas", ["mengantisipasi hambatan dan recovery"]],
      ["Applied/Portfolio", "Terbukti dalam proyek", ["memiliki bukti konsistensi lintas proyek"]],
    ]),
    safetyClass: "minor_safe",
    active: true,
  },
  {
    id: "TAL-01",
    version: 1,
    domain: "Talent & Interest",
    subdomain: "Self-discovery",
    title: "Interest-to-activity alignment",
    description: "Menghubungkan minat dengan aktivitas eksplorasi dan bukti pengalaman nyata.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["mengidentifikasi minat", "mencoba aktivitas", "membandingkan pengalaman", "merefleksikan kecocokan"],
    evidenceTypes: ["assessment", "reflection", "project"],
    rubric: rubric([
      ["Explore", "Menyebutkan area minat", ["memilih beberapa aktivitas"]],
      ["Foundation", "Mencoba aktivitas terarah", ["menyelesaikan satu eksplorasi"]],
      ["Developing", "Membandingkan pengalaman", ["menjelaskan apa yang cocok/tidak cocok"]],
      ["Proficient", "Memilih fokus sementara", ["membuat alasan berbasis pengalaman"]],
      ["Advanced", "Mengembangkan spesialisasi", ["menghubungkan minat dengan kompetensi"]],
      ["Applied/Portfolio", "Memiliki bukti karya", ["menyusun portfolio eksplorasi"]],
    ]),
    safetyClass: "minor_safe",
    active: true,
  },
  {
    id: "SOFT-01",
    version: 1,
    domain: "Soft Skills",
    subdomain: "Communication",
    title: "Public speaking",
    description: "Menyampaikan ide secara terstruktur, jelas, dan sesuai audiens.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["struktur pesan", "kejelasan", "pace", "respons terhadap pertanyaan"],
    evidenceTypes: ["assessment", "live_observation", "project", "portfolio"],
    rubric: rubric([
      ["Explore", "Berani menyampaikan ide", ["menyampaikan pesan singkat"]],
      ["Foundation", "Pesan memiliki pembuka-isi-penutup", ["struktur dasar terlihat"]],
      ["Developing", "Penyampaian makin jelas", ["pace dan contoh cukup terkontrol"]],
      ["Proficient", "Adaptif terhadap audiens", ["menjawab pertanyaan secara relevan"]],
      ["Advanced", "Meyakinkan dan terstruktur", ["menggunakan bukti dan transisi efektif"]],
      ["Applied/Portfolio", "Terbukti dalam konteks nyata", ["memiliki rekaman/karya terverifikasi"]],
    ]),
    safetyClass: "high_impact_review",
    active: true,
  },
  {
    id: "SOFT-02",
    version: 1,
    domain: "Soft Skills",
    subdomain: "Collaboration",
    title: "Team collaboration",
    description: "Bekerja bersama dengan pembagian peran, komunikasi, dan penyelesaian konflik yang konstruktif.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["turn-taking", "role clarity", "listening", "conflict handling"],
    evidenceTypes: ["project", "mentor_review", "live_observation"],
    rubric: rubric([
      ["Explore", "Berpartisipasi", ["mengikuti aktivitas kelompok"]],
      ["Foundation", "Menjalankan peran", ["menyelesaikan bagian tugas"]],
      ["Developing", "Berkoordinasi", ["memberi dan menerima umpan balik"]],
      ["Proficient", "Membantu tim", ["menjaga koordinasi dan penyelesaian"]],
      ["Advanced", "Memfasilitasi kolaborasi", ["membantu tim menghadapi hambatan"]],
      ["Applied/Portfolio", "Terbukti lintas proyek", ["ada bukti kontribusi terverifikasi"]],
    ]),
    safetyClass: "high_impact_review",
    active: true,
  },
  {
    id: "HARD-IT-01",
    version: 1,
    domain: "Hard Skills",
    subdomain: "Technology",
    title: "Digital problem solving",
    description: "Menggunakan alat digital secara aman untuk memecahkan masalah yang terdefinisi.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["memahami masalah", "memilih tools", "menguji solusi", "mendokumentasikan hasil"],
    evidenceTypes: ["assessment", "project", "portfolio"],
    rubric: rubric([
      ["Explore", "Mengikuti contoh", ["menyelesaikan langkah terpandu"]],
      ["Foundation", "Menggunakan tool dasar", ["menghasilkan output sesuai instruksi"]],
      ["Developing", "Memilih langkah penyelesaian", ["melakukan debugging sederhana"]],
      ["Proficient", "Menyelesaikan masalah mandiri", ["memvalidasi hasil"]],
      ["Advanced", "Mendesain solusi", ["membandingkan alternatif dan trade-off"]],
      ["Applied/Portfolio", "Menghasilkan karya", ["project dapat direview ulang"]],
    ]),
    safetyClass: "minor_safe",
    active: true,
  },
  {
    id: "HARD-CUL-01",
    version: 1,
    domain: "Hard Skills",
    subdomain: "Culinary",
    title: "Culinary fundamentals",
    description: "Menerapkan dasar persiapan, proses memasak, kebersihan, dan presentasi makanan.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["mise en place", "sanitasi", "teknik dasar", "presentasi"],
    evidenceTypes: ["practical_assessment", "video_evidence", "mentor_review"],
    rubric: rubric([
      ["Explore", "Mengenal alat dan proses", ["mengikuti instruksi keselamatan"]],
      ["Foundation", "Melakukan teknik dasar", ["menghasilkan produk sederhana"]],
      ["Developing", "Menjaga konsistensi", ["mengikuti resep/prosedur"]],
      ["Proficient", "Bekerja mandiri", ["mengelola waktu dan kebersihan"]],
      ["Advanced", "Mengadaptasi teknik", ["membuat variasi terukur"]],
      ["Applied/Portfolio", "Karya siap dipresentasikan", ["portfolio berisi proses dan hasil"]],
    ]),
    safetyClass: "high_impact_review",
    active: true,
  },
  {
    id: "HARD-HOS-01",
    version: 1,
    domain: "Hard Skills",
    subdomain: "Hospitality",
    title: "Guest service fundamentals",
    description: "Menerapkan komunikasi layanan, prosedur dasar, dan penyelesaian kebutuhan tamu.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["greeting", "needs discovery", "procedure adherence", "response"],
    evidenceTypes: ["role_play", "assessment", "mentor_review"],
    rubric: rubric([
      ["Explore", "Mengenal alur layanan", ["mengikuti skenario"]],
      ["Foundation", "Melakukan layanan dasar", ["menggunakan bahasa layanan yang tepat"]],
      ["Developing", "Menangani kebutuhan", ["mengajukan pertanyaan relevan"]],
      ["Proficient", "Menangani skenario mandiri", ["mengikuti SOP"]],
      ["Advanced", "Menangani variasi situasi", ["memilih respons sesuai konteks"]],
      ["Applied/Portfolio", "Terbukti dalam simulasi/proyek", ["bukti direview mentor"]],
    ]),
    safetyClass: "high_impact_review",
    active: true,
  },
  {
    id: "LIFE-01",
    version: 1,
    domain: "Life Skills",
    subdomain: "Decision making",
    title: "Practical decision making",
    description: "Membandingkan pilihan, konsekuensi, dan risiko sebelum mengambil keputusan sehari-hari.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["problem framing", "options", "trade-offs", "reflection"],
    evidenceTypes: ["scenario_assessment", "reflection", "project"],
    rubric: rubric([
      ["Explore", "Mengenali pilihan", ["menyebutkan beberapa opsi"]],
      ["Foundation", "Membandingkan opsi", ["menjelaskan konsekuensi dasar"]],
      ["Developing", "Mempertimbangkan risiko", ["membedakan prioritas"]],
      ["Proficient", "Mengambil keputusan terstruktur", ["menjelaskan alasan"]],
      ["Advanced", "Menangani trade-off", ["mengantisipasi dampak"]],
      ["Applied/Portfolio", "Menerapkan pada proyek nyata", ["mendokumentasikan proses keputusan"]],
    ]),
    safetyClass: "minor_safe",
    active: true,
  },
  {
    id: "SOFT-03",
    version: 1,
    domain: "Soft Skills",
    subdomain: "Presentation",
    title: "Presentation delivery",
    description: "Mengorganisasi materi dan menyampaikannya dengan media yang mendukung tujuan.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["structure", "visual support", "pace", "Q&A"],
    evidenceTypes: ["live_observation", "portfolio", "assessment"],
    rubric: rubric([
      ["Explore", "Menyampaikan materi singkat", ["mengikuti outline"]],
      ["Foundation", "Menggunakan media dasar", ["slide/alat bantu relevan"]],
      ["Developing", "Mengontrol alur", ["transisi dan pace cukup konsisten"]],
      ["Proficient", "Berinteraksi dengan audiens", ["menjawab pertanyaan relevan"]],
      ["Advanced", "Mengadaptasi delivery", ["mengubah pendekatan sesuai konteks"]],
      ["Applied/Portfolio", "Karya presentasi terdokumentasi", ["bukti dapat diverifikasi"]],
    ]),
    safetyClass: "high_impact_review",
    active: true,
  },
  {
    id: "HARD-CRE-01",
    version: 1,
    domain: "Hard Skills",
    subdomain: "Creative",
    title: "Creative production",
    description: "Menghasilkan karya kreatif dengan brief, proses, revisi, dan dokumentasi.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["brief interpretation", "process", "revision", "final output"],
    evidenceTypes: ["project", "portfolio", "mentor_review"],
    rubric: rubric([
      ["Explore", "Mencoba medium", ["mengikuti brief sederhana"]],
      ["Foundation", "Menghasilkan karya", ["output memenuhi brief dasar"]],
      ["Developing", "Melakukan revisi", ["menggunakan feedback"]],
      ["Proficient", "Mengelola proses", ["mendokumentasikan versi"]],
      ["Advanced", "Mengembangkan konsep", ["alasan kreatif dapat dijelaskan"]],
      ["Applied/Portfolio", "Portfolio siap ditampilkan", ["karya dan proses terverifikasi"]],
    ]),
    safetyClass: "minor_safe",
    active: true,
  },
  {
    id: "HARD-BIZ-01",
    version: 1,
    domain: "Hard Skills",
    subdomain: "Business",
    title: "Entrepreneurial fundamentals",
    description: "Memahami masalah pelanggan, proposisi nilai, biaya dasar, dan eksperimen bisnis.",
    ageBands: ["SMP", "SMA_SMK", "UNIVERSITY", "PROFESSIONAL"],
    observableIndicators: ["customer problem", "value proposition", "basic costing", "experiment"],
    evidenceTypes: ["project", "presentation", "mentor_review"],
    rubric: rubric([
      ["Explore", "Mengenali masalah", ["mengidentifikasi kebutuhan sederhana"]],
      ["Foundation", "Menyusun ide solusi", ["menjelaskan target pengguna"]],
      ["Developing", "Menguji asumsi", ["melakukan eksperimen kecil"]],
      ["Proficient", "Menggunakan data sederhana", ["membandingkan hasil"]],
      ["Advanced", "Mengembangkan model", ["menjelaskan trade-off"]],
      ["Applied/Portfolio", "Project bisnis terdokumentasi", ["bukti eksperimen dan refleksi"]],
    ]),
    safetyClass: "minor_safe",
    active: true,
  },
];
