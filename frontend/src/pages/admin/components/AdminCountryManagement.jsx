import { useState, useEffect } from "react";
import countryService from "../../../services/countryService";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const AdminCountryManagement = () => {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // Popup state (Keeping structure for future implementation)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
  }, []);

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
  }, [page, size, keyword]);

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

  // Keep placeholders for action handlers
  const handleOpenForm = (country = null) => {
    setIsFormOpen(true);
  };
  const handleOpenDelete = (country) => {
    setIsDeleteOpen(true);
  };

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
                placeholder="Tìm kiếm quốc gia..."
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
                  <th className="px-5 py-4 w-[25%]">Tên quốc gia</th>
                  <th className="px-5 py-4 w-[15%]">Số người<br/>dùng</th>
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
                              title="Sửa"
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
              // Simple pagination logic to avoid too many buttons
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

      {/* Popup Form Thêm/Sửa */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">
              Tính năng chưa hỗ trợ
            </h2>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Xóa */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800">Xác nhận xóa</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tính năng chưa hỗ trợ.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCountryManagement;
