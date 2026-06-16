import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { getFilesByColor, previewDocument } from "../services/documentService";
import { getColorSummary, getColors } from "../services/colorService";
import { deleteDocument, renameDocument, updateDocumentColor } from "../services/fileActionService";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon, path: "/" },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon, path: "/documents" },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon, path: "/documents" },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon, path: "/summarize" },
  { key: "color-board", label: "Bảng màu", icon: PaletteOutlinedIcon, path: "/color-board" },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon, path: "/trash" },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon, path: "/settings" },
];

const formatDate = (value) => value ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : "-";
const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / (1024 ** index);
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};
const normalizeFile = (file = {}) => ({
  id: file.id,
  type: "file",
  name: file.name || "File",
  dateModified: file.updatedAt || file.createdAt || null,
  fileSize: file.size ?? file.fileSize ?? null,
  mimeType: file.type || "",
  color: file.color || null,
  colorCode: file.color?.hexCode || file.colorCode || "",
});

const ColorBoard = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [colors, setColors] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selected, setSelected] = useState({ key: "colored", label: "Tất cả màu", type: "colored" });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [menuState, setMenuState] = useState(null);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [preview, setPreview] = useState({ open: false, name: "", loading: false, error: "", url: "", text: "", kind: "" });

  const totalColored = useMemo(() => summary.reduce((sum, color) => sum + Number(color.fileCount || 0), 0), [summary]);

  const loadBoard = async () => {
    setLoading(true);
    try {
      const [colorList, colorSummary, fileList] = await Promise.all([
        getColors(),
        getColorSummary(),
        getFilesByColor({ colorId: selected.id, type: selected.type }),
      ]);
      setColors(Array.isArray(colorList) ? colorList : []);
      setSummary(Array.isArray(colorSummary) ? colorSummary : []);
      setFiles((Array.isArray(fileList) ? fileList : []).map(normalizeFile));
    } catch (error) {
      setToast(error.message || "Không thể tải bảng màu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBoard(); }, [selected.id, selected.type]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!menuState) return undefined;
    const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setMenuState(null); };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuState]);

  const openPreview = async (file) => {
    setPreview({ open: true, name: file.name, loading: true, error: "", url: "", text: "", kind: "" });
    try {
      const { blob, contentType } = await previewDocument(file.id);
      if (contentType?.startsWith("text/") || file.name.toLowerCase().match(/\.(txt|md|json|csv|log)$/)) {
        setPreview((prev) => ({ ...prev, loading: false, kind: "text", text: blob.text ? "" : "" }));
        const text = await blob.text();
        setPreview((prev) => ({ ...prev, text }));
        return;
      }
      const url = URL.createObjectURL(blob);
      setPreview((prev) => ({ ...prev, loading: false, kind: contentType?.startsWith("image/") ? "image" : "pdf", url }));
    } catch (error) {
      setPreview((prev) => ({ ...prev, loading: false, error: error.message || "Không thể xem trước file" }));
    }
  };
  const closePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url);
    setPreview({ open: false, name: "", loading: false, error: "", url: "", text: "", kind: "" });
  };
  const openContextMenu = (event, file) => { event.preventDefault(); setMenuState({ x: event.clientX, y: event.clientY, item: file }); };
  const refreshFiles = async () => setFiles((await getFilesByColor({ colorId: selected.id, type: selected.type })).map(normalizeFile));
  const renameFile = async () => {
    const nextName = window.prompt("Nhập tên mới", menuState.item.name);
    if (!nextName?.trim()) return;
    await renameDocument(menuState.item.id, nextName.trim());
    setToast("Đổi tên thành công");
    setMenuState(null);
    refreshFiles();
  };
  const deleteFile = async () => {
    await deleteDocument(menuState.item.id);
    setToast("Đã xóa file");
    setMenuState(null);
    refreshFiles();
  };
  const setFileColor = async (colorId) => {
    const updated = await updateDocumentColor(menuState.item.id, colorId);
    const normalized = normalizeFile(updated);
    setFiles((prev) => prev.map((file) => file.id === normalized.id ? normalized : file));
    setToast(colorId ? "Đã gắn màu" : "Đã bỏ màu");
    setMenuState(null);
    setColorMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_20px_65px_rgba(27,78,163,0.12)] dark:shadow-none transition-colors">
        <aside className="flex w-full flex-col gap-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/70 dark:bg-slate-800/40 p-4 md:w-20 md:border-b-0 md:border-r lg:w-64 transition-colors">
          <div className="flex items-center gap-3 px-1"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-lg font-extrabold text-white">D</div><div className="hidden lg:block"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">Workspace</div><div className="text-sm font-bold text-slate-700 dark:text-slate-200">Document Management System</div></div></div>
          <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {sidebarItems.map((item) => { const Icon = item.icon; const active = item.key === "color-board"; return <button key={item.key} type="button" onClick={() => navigate(item.path)} className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${active ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"}`}><Icon fontSize="small" /><span className="truncate text-sm font-semibold md:hidden lg:inline">{item.label}</span></button>; })}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <header className="border-b border-slate-100 dark:border-slate-700/50 pb-4"><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bảng màu</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Xem file theo màu đã gắn trong hệ thống.</p></header>
          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button type="button" onClick={() => setSelected({ key: "colored", label: "Tất cả màu", type: "colored" })} className={`rounded-2xl border p-4 text-left ${selected.key === "colored" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white dark:bg-slate-800"}`}><div className="font-semibold">Tất cả màu</div><div className="text-sm text-slate-500">{totalColored} file</div></button>
            <button type="button" onClick={() => setSelected({ key: "uncolored", label: "Không màu", type: "uncolored" })} className={`rounded-2xl border p-4 text-left ${selected.key === "uncolored" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white dark:bg-slate-800"}`}><div className="font-semibold">Không màu</div><div className="text-sm text-slate-500">File chưa gắn màu</div></button>
            {summary.filter((color) => Number(color.fileCount || 0) > 0).map((color) => <button key={color.id} type="button" onClick={() => setSelected({ key: `color-${color.id}`, label: color.name, id: color.id })} className={`rounded-2xl border p-4 text-left ${selected.id === color.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white dark:bg-slate-800"}`}><div className="flex items-center gap-2 font-semibold"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.hexCode }} />{color.name}</div><div className="text-sm text-slate-500">{color.fileCount} file</div></button>)}
          </section>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">{selected.label}</div>
            <table className="min-w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Date modified</th><th className="px-4 py-3 text-right">File size</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td className="px-4 py-4 text-sm text-slate-500" colSpan={3}>Đang tải...</td></tr> : files.map((file) => <tr key={file.id} onClick={() => openPreview(file)} onContextMenu={(event) => openContextMenu(event, file)} className="cursor-pointer hover:bg-blue-50/50"><td className="px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><PictureAsPdfOutlinedIcon fontSize="small" className="text-red-600" />{file.colorCode && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: file.colorCode }} />}<span className="truncate">{file.name}</span></div></td><td className="px-4 py-3 text-sm text-slate-600">{formatDate(file.dateModified)}</td><td className="px-4 py-3 text-right text-sm text-slate-600">{formatSize(file.fileSize)}</td></tr>)}</tbody></table>
          </section>
        </main>
      </div>
      {menuState && <div ref={menuRef} style={{ left: menuState.x, top: menuState.y }} className="fixed z-50 w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button onClick={renameFile} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100">Đổi tên</button><button onClick={deleteFile} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100">Xóa</button><div className="relative -mr-2 pr-2" onMouseEnter={() => setColorMenuOpen(true)} onMouseLeave={() => setColorMenuOpen(false)}><button className="flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"><span>Gắn màu</span><span>›</span></button>{colorMenuOpen && <div className="absolute left-full top-0 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl before:absolute before:-left-2 before:top-0 before:h-full before:w-2 before:content-['']"><button onClick={() => setFileColor(null)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"><span className="h-3 w-3 rounded-full border" />Bỏ màu</button>{colors.map((color) => <button key={color.id} onClick={() => setFileColor(color.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.hexCode }} /><span className="flex-1">{color.name}</span>{menuState.item?.color?.id === color.id && <span>✓</span>}</button>)}</div>}</div></div>}
      {preview.open && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-3"><div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-4 py-3"><div><div className="font-semibold">Xem trước file</div><div className="text-xs text-slate-500">{preview.name}</div></div><button onClick={closePreview}><CloseOutlinedIcon /></button></div><div className="min-h-0 flex-1 p-3">{preview.loading ? <div>Đang tải...</div> : preview.error ? <div>{preview.error}</div> : preview.kind === "text" ? <pre className="h-full overflow-auto rounded-xl bg-slate-50 p-4 text-xs">{preview.text}</pre> : preview.kind === "image" ? <img src={preview.url} alt={preview.name} className="h-full w-full object-contain" /> : <object data={`${preview.url}#navpanes=0&view=FitH`} type="application/pdf" className="h-full w-full rounded-xl" />}</div></div></div>}
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </div>
  );
};

export default ColorBoard;
