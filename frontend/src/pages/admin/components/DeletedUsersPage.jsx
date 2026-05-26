import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

const statusBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";

const DeletedUsersPage = ({
  users,
  isLoading,
  error,
  onRefresh,
  onRestore,
  onHardDelete,
  getAvatarLabel,
  formatDate,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600">
          {users.length} nguoi dung da xoa
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Lam moi
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
          Dang tai danh sach nguoi dung da xoa...
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-6 text-center text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && users.length === 0 && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
          Khong co nguoi dung da xoa
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Ngay tao</th>
                  <th className="px-4 py-3">Trang thai</th>
                  <th className="px-4 py-3 text-right">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-3">
                      {user.thumbnailUrl ? (
                        <img
                          src={user.thumbnailUrl}
                          alt={user.username}
                          onError={(event) => {
                            event.currentTarget.src = "";
                          }}
                          className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
                          {getAvatarLabel(user.username || user.email)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {user.username || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(user.createdAt || user.createdDate || user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}
                      >
                        DELETED
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onRestore(user)}
                          className="rounded-lg border border-slate-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title="Khoi phuc"
                          aria-label="Khoi phuc"
                        >
                          <RestoreFromTrashOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onHardDelete(user)}
                          className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:bg-rose-50"
                          title="Xoa vinh vien"
                          aria-label="Xoa vinh vien"
                        >
                          <DeleteForeverOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedUsersPage;
