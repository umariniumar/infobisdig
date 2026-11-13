// Tipe data dashboard. Bentuknya mengikuti data seed di data/*.json
// (diambil dari getboard artifact dashboard-kampus-bisnis-digital-uds, live v16).

export type Subject =
  | "CRM"
  | "Ekonomi Regional"
  | "Hukum Dan Regulasi Bisnis"
  | "Manajemen Risiko"
  | "Web App Development"
  | "Business Analytics dan Big Data"
  | "Sistem Manajemen Database"
  | "Teknologi Keuangan";

// Nama tampilan yang dipakai di kartu mata kuliah.
// "Customer Relationship Management (CRM)" (nama di Sevima) ditampilkan sebagai "CRM".
export const SUBJECTS: { canonical: string; display: string; lecturers: string[] }[] = [
  {
    canonical: "CRM",
    display: "CRM",
    lecturers: ["Melur Tri Swastika, S.M., M.M.", "Muhammad Rapita Kun Panuluh, S.E., M.M."],
  },
  {
    canonical: "Ekonomi Regional",
    display: "Ekonomi Regional",
    lecturers: ["Melur Tri Swastika, S.M., M.M.", "Muhammad Rapita Kun Panuluh, S.E., M.M."],
  },
  {
    canonical: "Hukum Dan Regulasi Bisnis",
    display: "Hukum dan Regulasi Bisnis",
    lecturers: ["Melur Tri Swastika, S.M., M.M.", "Muhammad Rapita Kun Panuluh, S.E., M.M."],
  },
  {
    canonical: "Manajemen Risiko",
    display: "Manajemen Risiko",
    lecturers: ["Melur Tri Swastika, S.M., M.M.", "Muhammad Rapita Kun Panuluh, S.E., M.M."],
  },
  {
    canonical: "Web App Development",
    display: "Web App Development",
    lecturers: [
      "Binar Putri Pratiwi, S.Kom., M.Tr.Kom.",
      "Erfan Nurkholis Efendi, S.Kom., M.Kom.",
      "Muhammad Mutawakkil Alallah, S.Kom., M.Kom.",
    ],
  },
  {
    canonical: "Business Analytics dan Big Data",
    display: "Business Analytics dan Big Data",
    lecturers: [
      "Arief Tri Nugroho, ST., M.Kom.",
      "Binar Putri Pratiwi, S.Kom., M.Tr.Kom.",
      "Muhammad Mutawakkil Alallah, S.Kom., M.Kom.",
    ],
  },
  {
    canonical: "Sistem Manajemen Database",
    display: "Sistem Manajemen Database",
    lecturers: [
      "Arief Tri Nugroho, ST., M.Kom.",
      "Binar Putri Pratiwi, S.Kom., M.Tr.Kom.",
      "Muhammad Mutawakkil Alallah, S.Kom., M.Kom.",
    ],
  },
  {
    canonical: "Teknologi Keuangan",
    display: "Teknologi Keuangan",
    lecturers: [
      "Arief Tri Nugroho, ST., M.Kom.",
      "Binar Putri Pratiwi, S.Kom., M.Tr.Kom.",
      "Erfan Nurkholis Efendi, S.Kom., M.Kom.",
    ],
  },
];

export function displaySubject(raw: string): string {
  if (raw === "Customer Relationship Management (CRM)") return "CRM";
  return raw;
}

export type ScheduleItem = {
  id: number;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  lecturer: string;
  location: string; // ruang (mis. BDIGI-7), "Online", atau link Zoom
  mode: "kelas" | "zoom" | "pengganti" | "lainnya";
  origin: "sevima" | "tambahan";
  note: string;
  isExample?: boolean;
};

export type InfoPost = {
  id: number;
  title: string;
  body: string;
  category: "pengumuman" | "jadwal" | "tugas" | "kegiatan";
  subject: string;
  source: string;
  pinned: boolean;
  urgent: boolean;
  expiresDate: string;
  mediaType: "" | "image" | "video";
  mediaUrl: string;
  mediaBlobKey: string;
  mediaFromUpload: boolean;
  createdAt: string;
  isExample?: boolean;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  subject: string;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:MM
  isExample?: boolean;
};

export type Article = {
  id: number;
  title: string;
  summary: string;
  body: string;
  subject: string;
  source: string;
  url: string;
  readingMinutes: number;
  mediaType: "" | "image" | "video";
  mediaUrl: string;
  mediaBlobKey: string;
  mediaFromUpload: boolean;
  createdAt: string;
  isExample?: boolean;
};

export type Board = {
  schedule: ScheduleItem[];
  info: InfoPost[];
  tasks: Task[];
  articles: Article[];
  source: "supabase" | "seed";
};
