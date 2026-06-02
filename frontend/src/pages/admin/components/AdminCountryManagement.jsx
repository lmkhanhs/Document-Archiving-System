import { useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";

const AdminCountryManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({ iso: "", nameVi: "", nameEn: "", phoneCode: "", flag: "", status: "Hoạt động" });
  const [formErrors, setFormErrors] = useState({});

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCountry, setDeletingCountry] = useState(null);

  const [countries, setCountries] = useState([
    { id: 1, flag: "🇻🇳", iso: "VN", nameVi: "Việt Nam", nameEn: "Vietnam", phoneCode: "+84", users: 5, status: "Hoạt động" },
    { id: 2, flag: "🇺🇸", iso: "US", nameVi: "Hoa Kỳ", nameEn: "United States", phoneCode: "+1", users: 2, status: "Hoạt động" },
    { id: 3, flag: "🇯🇵", iso: "JP", nameVi: "Nhật Bản", nameEn: "Japan", phoneCode: "+81", users: 1, status: "Hoạt động" },
    { id: 4, flag: "🇬🇧", iso: "GB", nameVi: "Vương quốc Anh", nameEn: "United Kingdom", phoneCode: "+44", users: 0, status: "Hoạt động" },
    { id: 5, flag: "🇩🇪", iso: "DE", nameVi: "Đức", nameEn: "Germany", phoneCode: "+49", users: 1, status: "Ngừng hoạt động" },
    { id: 6, flag: "🇫🇷", iso: "FR", nameVi: "Pháp", nameEn: "France", phoneCode: "+33", users: 0, status: "Hoạt động" },
  ]);
  const [search, setSearch] = useState("");

  const validateForm = () => {
    const errors = {};
    if (!formData.iso.trim()) errors.iso = "Mã ISO bắt buộc";
    else if (
      countries.some(
        (c) => c.iso.toLowerCase() === formData.iso.toLowerCase() && c.id !== editingCountry?.id
      )
    )
      errors.iso = "Mã ISO không được trùng";

    if (!formData.nameVi.trim()) errors.nameVi = "Tên quốc gia (Tiếng Việt) bắt buộc";
    if (!formData.nameEn.trim()) errors.nameEn = "Tên quốc gia (Tiếng Anh) bắt buộc";
    if (!formData.phoneCode.trim()) errors.phoneCode = "Mã vùng bắt buộc";
    if (!formData.status) errors.status = "Trạng thái bắt buộc";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenForm = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData(country);
    } else {
      setEditingCountry(null);
      setFormData({ iso: "", nameVi: "", nameEn: "", phoneCode: "", flag: "", status: "Hoạt động" });
    }
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCountry) {
      setCountries((prev) =>
        prev.map((c) => (c.id === editingCountry.id ? { ...c, ...formData } : c))
      );
    } else {
      setCountries((prev) => [
        ...prev,
        { ...formData, id: Date.now(), users: 0 },
      ]);
    }
    setIsFormOpen(false);
  };

  const handleOpenDelete = (country) => {
    setDeletingCountry(country);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCountry) {
      setCountries((prev) => prev.filter((c) => c.id !== deletingCountry.id));
    }
    setIsDeleteOpen(false);
    setDeletingCountry(null);
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.nameVi.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PublicOutlinedIcon fontSize="small" />
            </div>
            <div className="text-sm font-semibold text-slate-600">Tổng số quốc gia được hỗ trợ</div>
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">195</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleOutlineOutlinedIcon fontSize="small" />
            </div>
            <div className="text-sm font-semibold text-slate-600">Quốc gia đang hoạt động</div>
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">189</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
            <TrendingUpOutlinedIcon fontSize="small" />
          </div>
          <div className="text-sm font-semibold text-slate-600">Tỷ lệ phủ người dùng</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">62%</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AccessTimeOutlinedIcon fontSize="small" />
          </div>
          <div className="text-sm font-semibold text-slate-600">Quốc gia mới đăng ký</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">Đức</div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div className="text-base font-bold text-slate-800">
            Danh sách Quốc gia (Quản trị hệ thống)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <SearchOutlinedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm quốc gia, khu vực..."
                className="w-[260px] rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => handleOpenForm()}
              className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              + Add Country
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Cờ</th>
                  <th className="px-5 py-4">Mã ISO</th>
                  <th className="px-5 py-4">Tên quốc gia<br/><span className="text-[10px] font-normal text-slate-500">(Tiếng Việt)</span></th>
                  <th className="px-5 py-4">Tên quốc gia<br/><span className="text-[10px] font-normal text-slate-500">(Tiếng Anh)</span></th>
                  <th className="px-5 py-4">Mã vùng<br/><span className="text-[10px] font-normal text-slate-500">(+xx)</span></th>
                  <th className="px-5 py-4">Số người<br/>dùng</th>
                  <th className="px-5 py-4">Trạng thái<br/><span className="text-[10px] font-normal text-slate-500">(Hoạt động/Ngừng)</span></th>
                  <th className="px-5 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <tr key={c.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-600">{c.id}</td>
                      <td className="px-5 py-4 text-2xl leading-none">{c.flag}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{c.iso}</td>
                      <td className="px-5 py-4 text-slate-700">{c.nameVi}</td>
                      <td className="px-5 py-4 text-slate-700">{c.nameEn}</td>
                      <td className="px-5 py-4 text-slate-600">{c.phoneCode}</td>
                      <td className="px-5 py-4 text-slate-600">{c.users}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${
                            c.status === "Hoạt động" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenForm(c)}
                            className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                            title="Sửa"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(c)}
                            className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                            title="Xóa"
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                      Không có dữ liệu quốc gia nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-slate-100 p-5 text-sm text-slate-600">
          <div>
            Hiển thị 1 đến {Math.min(6, filteredCountries.length)} trong 195 quốc gia
          </div>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
              {"<<"}
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
              {"<"}
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 font-semibold text-white">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50">
              3
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
              {">"}
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50">
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Popup Form Thêm/Sửa */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              {editingCountry ? "Sửa thông tin quốc gia" : "Thêm quốc gia mới"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Mã ISO <span className="text-rose-500">*</span></label>
                  <input
                    value={formData.iso}
                    onChange={(e) => setFormData({ ...formData, iso: e.target.value })}
                    className={`w-full rounded-xl border ${formErrors.iso ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"} px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white`}
                    placeholder="VD: VN"
                  />
                  {formErrors.iso && <p className="mt-1 text-xs text-rose-500">{formErrors.iso}</p>}
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Mã vùng <span className="text-rose-500">*</span></label>
                  <input
                    value={formData.phoneCode}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                    className={`w-full rounded-xl border ${formErrors.phoneCode ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"} px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white`}
                    placeholder="VD: +84"
                  />
                  {formErrors.phoneCode && <p className="mt-1 text-xs text-rose-500">{formErrors.phoneCode}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Tên quốc gia (Tiếng Việt) <span className="text-rose-500">*</span></label>
                <input
                  value={formData.nameVi}
                  onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                  className={`w-full rounded-xl border ${formErrors.nameVi ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"} px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white`}
                  placeholder="VD: Việt Nam"
                />
                {formErrors.nameVi && <p className="mt-1 text-xs text-rose-500">{formErrors.nameVi}</p>}
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">Tên quốc gia (Tiếng Anh) <span className="text-rose-500">*</span></label>
                <input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className={`w-full rounded-xl border ${formErrors.nameEn ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"} px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white`}
                  placeholder="VD: Vietnam"
                />
                {formErrors.nameEn && <p className="mt-1 text-xs text-rose-500">{formErrors.nameEn}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Cờ (Emoji)</label>
                  <input
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
                    placeholder="VD: 🇻🇳"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Trạng thái <span className="text-rose-500">*</span></label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full rounded-xl border ${formErrors.status ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"} px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white`}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                  </select>
                  {formErrors.status && <p className="mt-1 text-xs text-rose-500">{formErrors.status}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white transition hover:bg-blue-800"
                >
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Xóa */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">Xác nhận xóa</h2>
            <p className="mt-2 text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa quốc gia <strong>{deletingCountry?.nameVi}</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCountryManagement;
