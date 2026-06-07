import { API_ORIGIN } from "../../../../services/api";

const FILE_TYPE_ORDER = ["DOCX", "PDF", "TXT", "ZIP", "Khác"];

export const FILE_TYPE_COLORS = {
  DOCX: "#2563eb",
  PDF: "#ef4444",
  XLSX: "#16a34a",
  ZIP: "#38bdf8",
  SQL: "#8b5cf6",
  JSON: "#f97316",
  TXT: "#facc15",
  IMAGE: "#ec4899",
  MP3: "#06b6d4",
  MP4: "#7c3aed",
  Khác: "#94a3b8",
};

const FILE_TYPE_PALETTE = ["#2563eb", "#ef4444", "#16a34a", "#38bdf8", "#8b5cf6", "#f97316", "#facc15", "#ec4899", "#06b6d4", "#94a3b8"];

export const mockDocuments = [
  {
    id: "mock-1",
    name: "BaoCaoTongHop.docx",
    typeLabel: "DOCX",
    size: 128 * 1024,
    createdAt: new Date().toISOString(),
    ownerLabel: "admin",
    ownerAvatar: "",
  },
  {
    id: "mock-2",
    name: "KeHoachDuAn.pdf",
    typeLabel: "PDF",
    size: 430 * 1024,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ownerLabel: "lewkhans@gmail.com",
    ownerAvatar: "",
  },
  {
    id: "mock-3",
    name: "summary-10.txt",
    typeLabel: "TXT",
    size: 24 * 1024,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ownerLabel: "khanhlm250204@gmail.com",
    ownerAvatar: "",
  },
  {
    id: "mock-4",
    name: "sakila-db.zip",
    typeLabel: "ZIP",
    size: 713 * 1024,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ownerLabel: "lewkhans@gmail.com",
    ownerAvatar: "",
  },
  {
    id: "mock-5",
    name: "TaiLieuMauTomTat.docx",
    typeLabel: "DOCX",
    size: 96 * 1024,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    ownerLabel: "admin",
    ownerAvatar: "",
  },
  {
    id: "mock-6",
    name: "data.json",
    typeLabel: "JSON",
    size: 58 * 1024,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ownerLabel: "lmkhanhs",
    ownerAvatar: "",
  },
];

const normalizeType = (file) => {
  const rawType = String(file?.typeLabel || file?.fileType || file?.mimeType || "").toUpperCase();
  const fileName = String(file?.name || file?.fileName || "");
  const extension = fileName.includes(".") ? fileName.split(".").pop().toUpperCase() : "";
  const type = rawType && rawType !== "—" ? rawType : extension;

  if (type.includes("DOCX") || type.includes("WORD")) return "DOCX";
  if (type.includes("PDF")) return "PDF";
  if (type.includes("TXT") || type.includes("TEXT")) return "TXT";
  if (type.includes("ZIP") || type.includes("RAR") || type.includes("7Z")) return "ZIP";
  return "Khác";
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toShortDateLabel = (date) => `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getAvatarLabel = (value) => {
  const text = String(value || "").trim();
  return text ? text.charAt(0).toUpperCase() : "A";
};

export const getChartDocuments = (documents = []) => (
  Array.isArray(documents) && documents.length > 0 ? documents : mockDocuments
);

export const buildFileTypeData = (documents = []) => {
  const total = documents.length;
  const counts = FILE_TYPE_ORDER.reduce((acc, type) => ({ ...acc, [type]: 0 }), {});

  documents.forEach((file) => {
    counts[normalizeType(file)] += 1;
  });

  return FILE_TYPE_ORDER.map((type) => ({
    name: type,
    value: counts[type],
    percent: total > 0 ? Math.round((counts[type] / total) * 100) : 0,
    color: FILE_TYPE_COLORS[type],
  }));
};

export const buildFileTypeRatioData = (items = []) => (
  Array.isArray(items)
    ? items.map((item, index) => {
      const name = item?.type || item?.name || "Khác";
      return {
        name,
        value: Number(item?.count) || 0,
        percent: Number(item?.percentage) || 0,
        color: FILE_TYPE_COLORS[name] || FILE_TYPE_PALETTE[index % FILE_TYPE_PALETTE.length],
      };
    })
    : []
);

export const buildRecentUploadData = (documents = [], days = 7) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return {
      key: toDateKey(date),
      label: toShortDateLabel(date),
      fullDate: date.toLocaleDateString("vi-VN"),
      count: 0,
    };
  });

  const bucketMap = new Map(buckets.map((item) => [item.key, item]));

  documents.forEach((file) => {
    const date = new Date(file?.createdAt || file?.uploadedAt || file?.createdDate || file?.created_at || "");
    if (Number.isNaN(date.getTime())) return;
    date.setHours(0, 0, 0, 0);
    const bucket = bucketMap.get(toDateKey(date));
    if (bucket) bucket.count += 1;
  });

  return buckets;
};

export const buildRecentUploadApiData = (items = []) => (
  Array.isArray(items)
    ? items.map((item) => ({
      key: item?.date || "",
      label: item?.date || "",
      fullDate: item?.date || "",
      count: Number(item?.count) || 0,
    }))
    : []
);

export const buildTopUploadersData = (documents = [], limit = 5) => {
  const map = new Map();

  documents.forEach((file) => {
    const name = file?.ownerLabel || file?.ownerName || file?.username || "Không xác định";
    const current = map.get(name) || {
      name,
      count: 0,
      avatar: file?.ownerAvatar || "",
      label: getAvatarLabel(name),
    };
    current.count += 1;
    current.avatar = current.avatar || file?.ownerAvatar || "";
    map.set(name, current);
  });

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const buildTopUploadersApiData = (items = []) => (
  Array.isArray(items)
    ? items.map((item) => {
      const name = item?.username || item?.email || "Không xác định";
      let avatar = item?.avatarUrl || "";
      if (avatar && !avatar.startsWith("http")) {
        avatar = `${API_ORIGIN}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
      }
      return {
        name,
        count: Number(item?.documentCount) || 0,
        avatar,
        label: getAvatarLabel(name),
      };
    })
    : []
);
