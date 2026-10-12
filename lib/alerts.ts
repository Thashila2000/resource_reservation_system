import Swal from "sweetalert2";

/**
 * Custom dark glass-themed SweetAlert instance for PrimeWave RRMS
 */
export const AppSwal = Swal.mixin({
  background: "#111827", // dark slate
  color: "#f8fafc", // slate-50
  backdrop: "rgba(11, 15, 23, 0.75)",
  customClass: {
    popup: "border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl",
    title: "text-white font-bold text-lg",
    htmlContainer: "text-slate-300 text-sm",
    confirmButton:
      "rounded-lg px-4 py-2 font-semibold text-xs text-white shadow-md transition-all",
    cancelButton:
      "rounded-lg px-4 py-2 font-semibold text-xs text-slate-300 hover:text-white transition-all",
  },
  buttonsStyling: false,
});

/**
 * Prompt confirmation alert before high-impact actions like deletion
 */
export async function confirmDeleteAlert({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmButtonText = "Yes, delete",
  cancelButtonText = "Cancel",
}: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
} = {}): Promise<boolean> {
  const result = await AppSwal.fire({
    title,
    text,
    icon: "warning",
    iconColor: "#f43f5e", // rose-500
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: "border border-white/10 rounded-2xl shadow-2xl bg-[#111827]",
      title: "text-white font-bold text-base",
      htmlContainer: "text-slate-300 text-xs",
      confirmButton:
        "rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/30 transition-all mr-2",
      cancelButton:
        "rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all",
    },
  });

  return result.isConfirmed;
}

/**
 * Display a success alert modal
 */
export async function showSuccessAlert(title: string, text?: string) {
  return await AppSwal.fire({
    icon: "success",
    iconColor: "#10b981", // emerald-500
    title,
    text,
    timer: 3000,
    timerProgressBar: true,
    confirmButtonText: "OK",
    customClass: {
      popup: "border border-white/10 rounded-2xl shadow-2xl bg-[#111827]",
      title: "text-white font-bold text-base",
      htmlContainer: "text-slate-300 text-xs",
      confirmButton:
        "rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-all",
    },
  });
}

/**
 * Display an error alert modal
 */
export async function showErrorAlert(title: string, text?: string) {
  return await AppSwal.fire({
    icon: "error",
    iconColor: "#ef4444", // red-500
    title,
    text,
    confirmButtonText: "Close",
    customClass: {
      popup: "border border-white/10 rounded-2xl shadow-2xl bg-[#111827]",
      title: "text-white font-bold text-base",
      htmlContainer: "text-slate-300 text-xs",
      confirmButton:
        "rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-semibold text-white transition-all",
    },
  });
}

/**
 * Lightweight top-right toast notification
 */
export function showToast(title: string, icon: "success" | "error" | "info" | "warning" = "success") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    background: "#1e293b",
    color: "#ffffff",
    customClass: {
      popup: "border border-white/10 rounded-xl shadow-xl backdrop-blur-md",
      title: "text-xs font-semibold text-white",
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  return Toast.fire({
    icon,
    title,
  });
}
