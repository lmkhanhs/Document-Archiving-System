import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { changePassword } from "../../services/authService";

const schema = yup.object().shape({
  currentPassword: yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
  newPassword: yup
    .string()
    .required("Vui lòng nhập mật khẩu mới")
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu mới")
    .oneOf([yup.ref("newPassword")], "Xác nhận mật khẩu không khớp"),
});

const ChangePasswordSettings = ({ showToast }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showToast("success", "Đổi mật khẩu thành công!");
      reset();
    } catch (err) {
      showToast("error", err.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Đổi mật khẩu</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 max-w-2xl">
          <div className="space-y-6">
            {/* Mật khẩu hiện tại */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <LockOutlinedIcon style={{ fontSize: 16 }} />
                Mật khẩu hiện tại <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  {...register("currentPassword")}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-900 outline-none transition focus:ring-2 pr-12 ${
                    errors.currentPassword
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/20"
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showCurrent ? (
                    <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityOutlinedIcon style={{ fontSize: 20 }} />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
              {/* Mật khẩu mới */}
              <div className="mb-6">
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <LockResetOutlinedIcon style={{ fontSize: 16 }} />
                  Mật khẩu mới <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    {...register("newPassword")}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-900 outline-none transition focus:ring-2 pr-12 ${
                      errors.newPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/20"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/20"
                    }`}
                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  >
                    {showNew ? (
                      <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                    ) : (
                      <VisibilityOutlinedIcon style={{ fontSize: 20 }} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <LockResetOutlinedIcon style={{ fontSize: 16 }} />
                  Xác nhận mật khẩu mới <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-900 outline-none transition focus:ring-2 pr-12 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/20"
                        : "border-slate-200 focus:border-blue-300 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/20"
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  >
                    {showConfirm ? (
                      <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                    ) : (
                      <VisibilityOutlinedIcon style={{ fontSize: 20 }} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

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
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <SaveOutlinedIcon style={{ fontSize: 18 }} />
                  Cập nhật mật khẩu
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default ChangePasswordSettings;
