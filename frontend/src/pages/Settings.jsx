import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { API_ORIGIN } from "../services/api";
import { getInfoUser, logout } from "../services/authService";
import {
  getDetailUser,
  updateProfile,
  updateAvatar,
  getGenders,
  getCountries,
} from "../services/userService";

const sidebarItems = [
  { key: "home", label: "Trang chủ", icon: HomeOutlinedIcon },
  { key: "documents", label: "Tài liệu của tôi", icon: FolderOpenOutlinedIcon },
  { key: "upload", label: "Tải lên tài liệu", icon: UploadFileOutlinedIcon },
  { key: "summarize", label: "Tóm tắt AI", icon: AutoAwesomeOutlinedIcon },
  { key: "trash", label: "Thùng rác", icon: DeleteOutlineOutlinedIcon },
  { key: "settings", label: "Cài đặt", icon: SettingsOutlinedIcon },
];

const USER_CACHE_KEY = "currentUser";

const resolveThumbnailUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
};

const isGoogleUser = (user) => {
  const thumb = user?.thumbnailUrl || "";
  return thumb.startsWith("http://") || thumb.startsWith("https://");
};

const schema = yup.object().shape({
  fullName: yup.string().required("Họ tên không được để trống").trim(),
  email: yup.string().email("Email không hợp lệ").nullable(),
  phone: yup
    .string()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .matches(/^(\+?\d{9,15})?$/, "Số điện thoại không hợp lệ"),
  address: yup.string().nullable(),
  city: yup.string().nullable(),
  genderId: yup
    .number()
    .nullable()
    .transform((v, original) => (original === "" || original === null ? null : v)),
  countryId: yup
    .number()
    .nullable()
    .transform((v, original) => (original === "" || original === null ? null : v)),
});

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Settings = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [genders, setGenders] = useState([]);
  const [countries, setCountries] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      genderId: "",
      countryId: "",
    },
  });

  // Load user detail + genders + countries
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [detail, genderList, countryList] = await Promise.all([
          getDetailUser(),
          getGenders(),
          getCountries(),
        ]);

        if (!mounted) return;

        setUser(detail);
        setGenders(Array.isArray(genderList) ? genderList : []);
        setCountries(Array.isArray(countryList) ? countryList : []);
        setAvatarPreview(resolveThumbnailUrl(detail?.thumbnailUrl));

        reset({
          fullName: detail?.fullName || "",
          email: detail?.email || "",
          phone: detail?.phone || "",
          address: detail?.address || "",
          city: detail?.city || "",
          genderId: detail?.genderId ?? "",
          countryId: detail?.countryId ?? "",
        });
      } catch {
        showToast("error", "Không thể tải thông tin người dùng");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [reset]);

  // Toast auto dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        genderId: data.genderId || null,
        countryId: data.countryId || null,
      };
      const updated = await updateProfile(payload);
      setUser(updated);
      reset({
        fullName: updated?.fullName || "",
        email: updated?.email || "",
        phone: updated?.phone || "",
        address: updated?.address || "",
        city: updated?.city || "",
        genderId: updated?.genderId ?? "",
        countryId: updated?.countryId ?? "",
      });

      // Refresh cached user for header/sidebar
      try {
        const freshInfo = await getInfoUser();
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(freshInfo));
      } catch {
        // Non-critical
      }

      showToast("success", "Cập nhật hồ sơ thành công!");
    } catch (err) {
      showToast("error", err.message || "Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);

    try {
      const updated = await updateAvatar(file);
      setUser(updated);
      setAvatarPreview(resolveThumbnailUrl(updated?.thumbnailUrl));

      // Refresh cached user
      try {
        const freshInfo = await getInfoUser();
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(freshInfo));
      } catch {
        // Non-critical
      }

      showToast("success", "Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      showToast("error", err.message || "Upload ảnh thất bại");
      setAvatarPreview(resolveThumbnailUrl(user?.thumbnailUrl));
    } finally {
      e.target.value = "";
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout({
        accessToken: localStorage.getItem("accessToken") || "",
        refreshToken: localStorage.getItem("refreshToken") || "",
      });
    } catch {
      // continue
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem(USER_CACHE_KEY);
      navigate("/login", { replace: true });
    }
  };

  const handleSidebarClick = (key) => {
    if (key === "home") navigate("/");
    if (key === "documents") navigate("/documents");
    if (key === "summarize") navigate("/summarize");
    if (key === "trash") navigate("/trash");
    if (key === "settings") return; // already here
  };

  const avatarLabel = (() => {
    const name = user?.fullName || user?.email || user?.username || "";
    return name ? name.charAt(0).toUpperCase() : "U";
  })();

  const googleFlag = isGoogleUser(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white p-3 md:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_20px_65px_rgba(27,78,163,0.12)]">
        {/* Sidebar */}
        <aside className="flex w-full flex-col gap-4 border-b border-slate-200 bg-slate-50/70 p-4 md:w-20 md:border-b-0 md:border-r lg:w-64">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-lg font-extrabold text-white">
              D
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Workspace
              </div>
              <div className="text-sm font-bold text-slate-700">Document Management System</div>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {sidebarItems.map((item) => {
              const isActive = item.key === "settings";
              const MenuIcon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSidebarClick(item.key)}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <MenuIcon fontSize="small" />
                  <span className="truncate text-sm font-semibold md:hidden lg:inline">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto hidden lg:block">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogoutOutlinedIcon fontSize="small" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Cài đặt hồ sơ</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý thông tin cá nhân và tùy chỉnh tài khoản của bạn
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-slate-200" />
                  <div className="space-y-3">
                    <div className="h-5 w-48 rounded bg-slate-200" />
                    <div className="h-4 w-32 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="h-10 rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Avatar Card */}
              <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50/60 to-sky-50/40 p-6 md:p-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative group">
                    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-blue-100">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          onError={() => setAvatarPreview("")}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-sky-400 text-4xl font-bold text-white">
                          {avatarLabel}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      <PhotoCameraOutlinedIcon style={{ fontSize: 16 }} />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-slate-800">
                      {user?.fullName || user?.username || "Người dùng"}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">{user?.email || user?.username}</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                      {user?.roles?.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            role === "ADMIN"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <SecurityOutlinedIcon style={{ fontSize: 12 }} />
                          {role}
                        </span>
                      ))}
                      {googleFlag && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Google Account
                        </span>
                      )}
                    </div>
                    {isUploadingAvatar && (
                      <p className="mt-2 text-xs font-medium text-blue-600 animate-pulse">
                        Đang tải ảnh lên...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
                  <h3 className="mb-6 text-lg font-bold text-slate-800">Thông tin cá nhân</h3>

                  <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                    {/* Họ tên */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <BadgeOutlinedIcon style={{ fontSize: 16 }} />
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("fullName")}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                          errors.fullName
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <EmailOutlinedIcon style={{ fontSize: 16 }} />
                        Email
                        {user?.email && (
                          <span className="ml-1 text-xs font-normal text-slate-400">(Không thể sửa)</span>
                        )}
                      </label>
                      <input
                        {...register("email")}
                        disabled={!!user?.email}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                          !!user?.email
                            ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            : errors.email
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100 text-slate-700 bg-white"
                            : "border-slate-200 focus:border-blue-300 focus:ring-blue-100 text-slate-700 bg-white"
                        }`}
                        placeholder="Nhập địa chỉ email"
                      />
                      {errors.email && !user?.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <PhoneOutlinedIcon style={{ fontSize: 16 }} />
                        Số điện thoại
                      </label>
                      <input
                        {...register("phone")}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 ${
                          errors.phone
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <LocationOnOutlinedIcon style={{ fontSize: 16 }} />
                        Địa chỉ
                      </label>
                      <input
                        {...register("address")}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    {/* Thành phố */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <LocationCityOutlinedIcon style={{ fontSize: 16 }} />
                        Thành phố
                      </label>
                      <input
                        {...register("city")}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        placeholder="Nhập thành phố"
                      />
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <PersonOutlinedIcon style={{ fontSize: 16 }} />
                        Giới tính
                      </label>
                      <div className="relative">
                        {user?.genderId && (
                          <img
                            src={genders.find((g) => g.id == user?.genderId)?.thumbnailUrl || ""}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 object-contain"
                            alt=""
                          />
                        )}
                        <select
                          {...register("genderId")}
                          onChange={(e) => {
                            register("genderId").onChange(e);
                            setUser((prev) => ({ ...prev, genderId: e.target.value }));
                          }}
                          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${
                            user?.genderId ? "pl-11" : ""
                          }`}
                        >
                          <option value="">-- Chọn giới tính --</option>
                          {genders.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quốc gia */}
                    <div className="md:col-span-2">
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <PublicOutlinedIcon style={{ fontSize: 16 }} />
                        Quốc gia
                      </label>
                      <div className="relative">
                        {user?.countryId && (
                          <img
                            src={resolveThumbnailUrl(countries.find((c) => c.id == user?.countryId)?.thumbnailUrl)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-7 object-cover shadow-sm rounded-sm"
                            alt=""
                          />
                        )}
                        <select
                          {...register("countryId")}
                          onChange={(e) => {
                            register("countryId").onChange(e);
                            setUser((prev) => ({ ...prev, countryId: e.target.value }));
                          }}
                          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${
                            user?.countryId ? "pl-12" : ""
                          }`}
                        >
                          <option value="">-- Chọn quốc gia --</option>
                          {countries.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Read-only info */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Thông tin tài khoản</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <SecurityOutlinedIcon className="text-slate-400" style={{ fontSize: 18 }} />
                        <div>
                          <div className="text-xs font-medium text-slate-400">Vai trò</div>
                          <div className="text-sm font-semibold text-slate-700">
                            {user?.roles?.join(", ") || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <CalendarTodayOutlinedIcon className="text-slate-400" style={{ fontSize: 18 }} />
                        <div>
                          <div className="text-xs font-medium text-slate-400">Ngày tạo tài khoản</div>
                          <div className="text-sm font-semibold text-slate-700">
                            {formatDate(user?.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || !isDirty}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <SaveOutlinedIcon style={{ fontSize: 18 }} />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircleOutlineIcon style={{ fontSize: 18 }} />
          ) : (
            <ErrorOutlineIcon style={{ fontSize: 18 }} />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Settings;
