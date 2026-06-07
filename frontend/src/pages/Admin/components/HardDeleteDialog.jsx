const HardDeleteDialog = ({ open, user, submitting, onClose, onConfirm }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 dark:bg-black/70 p-3">
      <div className="w-full max-w-md animate-[fadeUp_160ms_ease-out] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-2xl">
        <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Xoa vinh vien</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
          Canh bao: Hanh dong nay se xoa vinh vien nguoi dung <span className="font-semibold">{user?.username}</span> va khong the khoi phuc.
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {submitting ? "Dang xoa..." : "Xoa vinh vien"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HardDeleteDialog;
