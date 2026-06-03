import { useState, useEffect } from "react";
import countryService from "../../../services/countryService";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const AdminCountryManagement = () => {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
    number: 0,
    size: 6,
    numberOfElements: 0,
    empty: true
  });

  const [statistics, setStatistics] = useState({
    totalSupportedCountries: 0,
    activeCountries: 0,
    userCoverageRate: 0,
    latestRegisteredCountry: null,
  });

  // Popup state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);

  // Form State
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    active: true
  });
  const [flagFile, setFlagFile] = useState(null);
  const [flagPreview, setFlagPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await countryService.getStatistics();
        if (data?.data) {
          setStatistics(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thống kê quốc gia:", error);
      }
    };
    fetchStatistics();
  }, [refreshTrigger]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchTerm);
      setPage(0); // Reset page to 0 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await countryService.getAdminCountries(page, size, keyword);
        if (response.code === 200 && response.data) {
          setCountries(response.data.content);
          setPagination({
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            first: response.data.first,
            last: response.data.last,
            number: response.data.number,
            size: response.data.size,
            numberOfElements: response.data.numberOfElements,
            empty: response.data.empty,
          });
        } else {
          setError("Không thể tải danh sách quốc gia");
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách quốc gia:", err);
        setError("Không thể tải danh sách quốc gia");
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, [page, size, keyword, refreshTrigger]);

  const extractCountryCodeFromFlag = (flagPath) => {
    if (!flagPath) return "--";
    const match = flagPath.match(/\/([^/]+)\.\w+$/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    return "--";
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPage(newPage);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ cho phép định dạng JPG, JPEG, PNG, WEBP");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Dung lượng file tối đa là 50MB");
      return;
    }
    setFlagFile(file);
    setFlagPreview(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    setFlagFile(null);
    setFlagPreview(null);
  };

  const handleOpenForm = (country = null) => {
    if (country) {
      setSelectedCountry(country);
      setFormData({ 
        name: country.name, 
        code: country.isoCode || extractCountryCodeFromFlag(country.flag), 
        active: country.active 
      });
      setFlagPreview(country.flag ? `http://localhost:8080${country.flag}` : null);
    } else {
      setSelectedCountry(null);
      setFormData({ name: "", code: "", active: true });
      setFlagPreview(null);
    }
    setFlagFile(null);
    setFormError(null);
    setIsFormOpen(true);
  };
  
  const handleOpenDelete = (country) => {
    setCountryToDelete(country);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!countryToDelete) return;
    setIsSubmitting(true);
    try {
      await countryService.deleteCountry(countryToDelete.id);
      setSuccessMessage("Xóa quốc gia thành công");
      setIsDeleteOpen(false);
      setCountryToDelete(null);
      setRefreshTrigger(prev => prev + 1);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Lỗi khi xóa quốc gia:", err);
      alert("Không thể xóa quốc gia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || (!flagFile && !selectedCountry)) {
      setFormError("Vui lòng điền đầy đủ tên, mã ISO và chọn ảnh cờ.");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("code", formData.code.trim());
      payload.append("active", formData.active);
      if (flagFile) {
        payload.append("file", flagFile);
      }

      if (selectedCountry) {
        await countryService.updateCountry(selectedCountry.id, payload);
        setSuccessMessage("Cập nhật quốc gia thành công");
      } else {
        await countryService.createCountry(payload);
        setSuccessMessage("Thêm quốc gia thành công");
      }
      
      // 3. Success -> Close and refresh
      setIsFormOpen(false);
      setRefreshTrigger(prev => prev + 1);
      
      // Auto hide success message
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error("Lỗi khi thêm quốc gia:", err);
      setFormError(err.message || "Đã xảy ra lỗi khi thêm quốc gia. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {successMessage && (
        <div className="fixed top-24 right-8 z-[100] flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 shadow-lg border border-emerald-200 animate-fade-in-down">
          <CheckCircleOutlineOutlinedIcon fontSize="small" />
          {successMessage}
        </div>
      )}

      {/* Thống kê */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PublicOutlinedIcon fontSize="small" />
            </div>
            <div className="text-sm font-semibold text-slate-600">Tổng số quốc gia được hỗ trợ</div>
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">{statistics.totalSupportedCountries}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircleOutlineOutlinedIcon fontSize="small" />
            </div>
            <div className="text-sm font-semibold text-slate-600">Quốc gia đang hoạt động</div>
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">{statistics.activeCountries}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
            <TrendingUpOutlinedIcon fontSize="small" />
          </div>
          <div className="text-sm font-semibold text-slate-600">Tỷ lệ phủ người dùng</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{statistics.userCoverageRate}%</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AccessTimeOutlinedIcon fontSize="small" />
          </div>
          <div className="text-sm font-semibold text-slate-600">Quốc gia mới đăng ký</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {statistics.latestRegisteredCountry ? statistics.latestRegisteredCountry.name : "N/A"}
          </div>
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
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm tên hoặc mã quốc gia..."
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
                  <th className="px-5 py-4 w-[10%]">ID</th>
                  <th className="px-5 py-4 w-[15%]">Cờ</th>
                  <th className="px-5 py-4 w-[15%]">Mã ISO</th>
                  <th className="px-5 py-4 w-[20%]">Tên quốc gia</th>
                  <th className="px-5 py-4 w-[12%]">Số người<br/>dùng</th>
                  <th className="px-5 py-4 w-[15%]">Ngày tạo</th>
                  <th className="px-5 py-4 w-[10%]">Trạng thái</th>
                  <th className="px-5 py-4 text-right w-[10%]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-rose-500 font-medium">
                      {error}
                    </td>
                  </tr>
                ) : countries.length > 0 ? (
                  countries.map((item) => {
                    const isoCode = item.isoCode || extractCountryCodeFromFlag(item.flag);
                    return (
                      <tr key={item.id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-4 text-slate-600">{item.id}</td>
                        <td className="px-5 py-4 leading-none">
                          {item.flag ? (
                            <>
                              <img 
                                src={`http://localhost:8080${item.flag}`} 
                                alt={item.name} 
                                className="h-6 w-8 object-cover rounded shadow-sm border border-slate-200" 
                                onError={(e) => { 
                                  e.target.style.display = 'none'; 
                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline'; 
                                }} 
                              />
                              <span style={{ display: 'none' }} className="font-semibold text-slate-700">{extractCountryCodeFromFlag(item.flag)}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-slate-700">{extractCountryCodeFromFlag(item.flag)}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{isoCode}</td>
                        <td className="px-5 py-4 text-slate-700">{item.name}</td>
                        <td className="px-5 py-4 text-slate-600">{item.userCount}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {item.createdAt ? new Intl.DateTimeFormat('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(new Date(item.createdAt)) : '--'}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${
                              item.active === true ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {item.active === true ? "Hoạt động" : "Ngừng hoạt động"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenForm(item)}
                              className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                              title="Chỉnh sửa"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                              title="Xóa"
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                      Không có quốc gia nào
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
            Hiển thị {pagination.numberOfElements > 0 ? pagination.number * pagination.size + 1 : 0} đến {pagination.number * pagination.size + pagination.numberOfElements} trong {pagination.totalElements} quốc gia
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={pagination.first}
              onClick={() => handlePageChange(0)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {"<<"}
            </button>
            <button 
              disabled={pagination.first}
              onClick={() => handlePageChange(pagination.number - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {"<"}
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i).map((pageNumber) => {
              if (
                pageNumber === 0 || 
                pageNumber === pagination.totalPages - 1 || 
                Math.abs(pageNumber - pagination.number) <= 1
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      pageNumber === pagination.number
                        ? "bg-blue-700 font-semibold text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber + 1}
                  </button>
                );
              } else if (
                pageNumber === 1 && pagination.number > 2 ||
                pageNumber === pagination.totalPages - 2 && pagination.number < pagination.totalPages - 3
              ) {
                return <span key={pageNumber} className="px-1 text-slate-400">...</span>;
              }
              return null;
            })}

            <button 
              disabled={pagination.last}
              onClick={() => handlePageChange(pagination.number + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {">"}
            </button>
            <button 
              disabled={pagination.last}
              onClick={() => handlePageChange(pagination.totalPages - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Popup Thêm Quốc Gia */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-800">
                {selectedCountry ? "Chỉnh sửa quốc gia" : "Thêm quốc gia mới"}
              </h2>
              <button 
                onClick={() => !isSubmitting && setIsFormOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                disabled={isSubmitting}
              >
                <CloseOutlinedIcon fontSize="small" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 text-sm">
              {formError && (
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Tên quốc gia <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Germany"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Mã ISO <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: DE"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white"
                  disabled={isSubmitting}
                  maxLength={2}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block font-semibold text-slate-700">
                  Ảnh cờ quốc gia <span className="text-rose-500">*</span>
                </label>
                {!flagPreview ? (
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 px-4 text-center transition hover:border-blue-400 hover:bg-blue-50 relative cursor-pointer"
                  >
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                    <div className="mb-2 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <CloudUploadOutlinedIcon />
                    </div>
                    <span className="font-semibold text-slate-700">Kéo thả ảnh vào đây</span>
                    <span className="mt-1 text-xs text-slate-500">Hoặc click để chọn file (JPG, PNG, WEBP - Max 50MB)</span>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex justify-center group">
                    <img src={flagPreview} alt="Preview" className="h-24 object-contain rounded" />
                    {!isSubmitting && (
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-500"
                        title="Xóa ảnh"
                      >
                        <CloseOutlinedIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">
                  Trạng thái hoạt động
                </label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={formData.active} 
                    onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                    disabled={isSubmitting}
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                </label>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center min-w-[140px] rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang xử lý...
                    </>
                  ) : selectedCountry ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm quốc gia"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Xóa */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fade-in-up">
            <h2 className="text-lg font-bold text-slate-800">Xác nhận xóa</h2>
            <p className="mt-2 text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa quốc gia này không?<br/>
              Quốc gia sẽ bị xóa mềm và không còn hiển thị trong danh sách quản lý.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setCountryToDelete(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Xóa quốc gia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCountryManagement;
