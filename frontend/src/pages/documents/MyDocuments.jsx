import { useCallback, useEffect, useMemo, useState } from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { getFolderContents, getRootFiles, getRootFolders } from "../../services/documentService";

const VIEW_MODE = {
  LIST: "list",
  GRID: "grid",
};

const ROOT_CRUMB = { id: null, name: "Root" };

const extractCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const extractFolders = (payload) => {
  const direct = [
    payload?.folders,
    payload?.folderList,
    payload?.subFolders,
    payload?.childrenFolders,
    payload?.directories,
  ];

  for (const candidate of direct) {
    const result = extractCollection(candidate);
    if (result.length > 0) {
      return result;
    }
  }

  return extractCollection(payload?.items || payload?.content).filter((item) => {
    const type = String(item?.type || item?.itemType || "").toLowerCase();
    return type === "folder";
  });
};

const extractFiles = (payload) => {
  const direct = [
    payload?.files,
    payload?.fileList,
    payload?.documents,
    payload?.childrenFiles,
  ];

  for (const candidate of direct) {
    const result = extractCollection(candidate);
    if (result.length > 0) {
      return result;
    }
  }

  return extractCollection(payload?.items || payload?.content).filter((item) => {
    const type = String(item?.type || item?.itemType || "").toLowerCase();
    return type === "file";
  });
};

const getDateValue = (item = {}) => (
  item.updatedAt
  || item.lastModifiedAt
  || item.modifiedAt
  || item.createdAt
  || null
);

const getFileSizeValue = (item = {}) => {
  const raw = item.fileSize ?? item.size ?? item.sizeBytes ?? null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) {
    return "-";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / (1024 ** index);

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const normalizeFolder = (folder) => ({
  id: folder.id || folder.folderId || `folder-${folder.name}`,
  type: "folder",
  name: folder.name || "Thư mục chưa đặt tên",
  dateModified: getDateValue(folder),
  fileSize: null,
});

const normalizeFile = (file) => ({
  id: file.id || file.fileId || `file-${file.name}`,
  type: "file",
  name: file.name || file.fileName || "Tệp chưa đặt tên",
  dateModified: getDateValue(file),
  fileSize: getFileSizeValue(file),
});

const normalizePathNode = (node, index) => {
  if (typeof node === "string") {
    return {
      id: index === 0 ? null : node,
      name: node || (index === 0 ? "Root" : "Folder"),
    };
  }

  return {
    id: node?.id ?? node?.folderId ?? (index === 0 ? null : null),
    name: node?.name || node?.label || node?.title || (index === 0 ? "Root" : "Folder"),
  };
};

const buildBreadcrumbs = (payload, fallback = [ROOT_CRUMB]) => {
  const rawPath = payload?.path || payload?.breadcrumbs || payload?.breadcrumb;
  const pathItems = Array.isArray(rawPath)
    ? rawPath
    : Array.isArray(rawPath?.items)
      ? rawPath.items
      : [];

  if (pathItems.length === 0) {
    return fallback;
  }

  const normalized = pathItems.map(normalizePathNode).filter((item) => Boolean(item?.name));

  if (normalized.length === 0) {
    return fallback;
  }

  const firstName = String(normalized[0].name || "").toLowerCase();
  if (normalized[0].id !== null && firstName !== "root") {
    return [ROOT_CRUMB, ...normalized];
  }

  return normalized;
};

const MyDocuments = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([ROOT_CRUMB]);

  const loadDocuments = useCallback(async ({ folderId = null, fallbackPath = [ROOT_CRUMB] } = {}) => {
    setIsLoading(true);
    setError("");

    try {
      let nextFolders = [];
      let nextFiles = [];
      let nextPath = fallbackPath;

      if (folderId === null || folderId === undefined) {
        const [folderPayload, filePayload] = await Promise.all([
          getRootFolders(),
          getRootFiles(),
        ]);

        nextFolders = extractCollection(folderPayload).map(normalizeFolder);
        nextFiles = extractCollection(filePayload).map(normalizeFile);
        nextPath = buildBreadcrumbs(folderPayload || filePayload, [ROOT_CRUMB]);
      } else {
        const payload = await getFolderContents(folderId);
        nextFolders = extractFolders(payload).map(normalizeFolder);
        nextFiles = extractFiles(payload).map(normalizeFile);
        nextPath = buildBreadcrumbs(payload, fallbackPath);
      }

      setFolders(nextFolders);
      setFiles(nextFiles);
      setCurrentFolderId(folderId ?? null);
      setBreadcrumbs(nextPath);
    } catch (requestError) {
      setError(requestError.message || "Không thể tải danh sách tài liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const allDocuments = useMemo(() => {
    const merged = [...folders, ...files];

    return merged.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      const first = a.dateModified ? new Date(a.dateModified).getTime() : 0;
      const second = b.dateModified ? new Date(b.dateModified).getTime() : 0;
      return second - first;
    });
  }, [folders, files]);

  const isListMode = viewMode === VIEW_MODE.LIST;

  const openFolder = (folder) => {
    if (!folder?.id) {
      return;
    }

    loadDocuments({
      folderId: folder.id,
      fallbackPath: [...breadcrumbs, { id: folder.id, name: folder.name }],
    });
  };

  const onClickCrumb = (crumb, index) => {
    if (index === 0 || crumb.id === null || crumb.id === undefined) {
      loadDocuments({ folderId: null, fallbackPath: [ROOT_CRUMB] });
      return;
    }

    loadDocuments({
      folderId: crumb.id,
      fallbackPath: breadcrumbs.slice(0, index + 1),
    });
  };

  const onRefresh = () => {
    loadDocuments({ folderId: currentFolderId, fallbackPath: breadcrumbs });
  };

  const folderCount = folders.length;
  const fileCount = files.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_20px_65px_rgba(27,78,163,0.12)]">
        <aside className="hidden w-64 border-r border-slate-200 bg-slate-50/70 p-4 lg:block">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-lg font-extrabold text-white">
              D
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Workspace</div>
              <div className="text-sm font-bold text-slate-700">Document Management System</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-blue-100/70 p-3 text-sm font-semibold text-blue-800">
            <div className="flex items-center gap-2">
              <FolderOpenOutlinedIcon fontSize="small" />
              Tài liệu của tôi
            </div>
            <div className="mt-2 text-xs font-medium text-blue-700/90">
              Đang mở: {breadcrumbs[breadcrumbs.length - 1]?.name || "Root"}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tài liệu của tôi</h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý thư mục và tệp với điều hướng phân cấp theo cấu trúc thư mục.
              </p>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshOutlinedIcon fontSize="small" />
              Làm mới
            </button>
          </header>

          <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode(VIEW_MODE.LIST)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isListMode
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <ViewListOutlinedIcon fontSize="small" />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode(VIEW_MODE.GRID)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  !isListMode
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <GridViewOutlinedIcon fontSize="small" />
                Grid
              </button>
            </div>

            <div className="text-sm text-slate-500">Tổng: {allDocuments.length} mục</div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
              {breadcrumbs.map((segment, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <div key={`${segment.id ?? "root"}-${segment.name}-${index}`} className="inline-flex items-center gap-1">
                    {index === 0 ? <HomeOutlinedIcon fontSize="inherit" /> : null}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onClickCrumb(segment, index)}
                      className={`rounded px-1.5 py-0.5 transition ${
                        isLast
                          ? "cursor-default font-semibold text-slate-800"
                          : "text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {segment.name}
                    </button>
                    {!isLast && <ChevronRightOutlinedIcon fontSize="inherit" className="text-slate-400" />}
                  </div>
                );
              })}
            </div>
          </section>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : isListMode ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Date modified</th>
                    <th className="px-4 py-3 text-right">File size</th>
                  </tr>
                </thead>
                <tbody>
                  {allDocuments.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className={`border-t border-slate-100 ${item.type === "folder" ? "cursor-pointer hover:bg-blue-50/50" : ""}`}
                      onClick={item.type === "folder" ? () => openFolder(item) : undefined}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                          {item.type === "folder" ? (
                            <FolderOutlinedIcon className="text-amber-600" fontSize="small" />
                          ) : (
                            <DescriptionOutlinedIcon className="text-blue-600" fontSize="small" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(item.dateModified)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{formatFileSize(item.fileSize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {allDocuments.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={item.type === "folder" ? () => openFolder(item) : undefined}
                  className={`rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition ${
                    item.type === "folder" ? "hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                    {item.type === "folder" ? (
                      <FolderOutlinedIcon className="text-amber-600" fontSize="small" />
                    ) : (
                      <DescriptionOutlinedIcon className="text-blue-600" fontSize="small" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">Date modified</div>
                  <div className="text-sm text-slate-700">{formatDate(item.dateModified)}</div>

                  <div className="mt-2 text-xs text-slate-500">File size</div>
                  <div className="text-sm text-slate-700">{formatFileSize(item.fileSize)}</div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && allDocuments.length === 0 && !error && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-600">
              Chưa có tài liệu nào trong thư mục hiện tại.
            </div>
          )}

          <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Folders</div>
              <div className="mt-2 text-2xl font-bold text-slate-800">{folderCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Files</div>
              <div className="mt-2 text-2xl font-bold text-slate-800">{fileCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Total items</div>
              <div className="mt-2 text-2xl font-bold text-slate-800">{allDocuments.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Current folder</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <InsertDriveFileOutlinedIcon fontSize="small" />
                <span className="truncate">{breadcrumbs[breadcrumbs.length - 1]?.name || "Root"}</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MyDocuments;
