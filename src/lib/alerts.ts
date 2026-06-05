import Swal, { type SweetAlertOptions } from "sweetalert2";

const base: SweetAlertOptions = {
  customClass: {
    popup: "salon-swal-popup",
    title: "salon-swal-title",
    htmlContainer: "salon-swal-text",
    confirmButton: "salon-swal-confirm",
    cancelButton: "salon-swal-cancel",
    actions: "salon-swal-actions",
  },
  buttonsStyling: false,
  showClass: { popup: "animate__animated animate__fadeInUp animate__faster" },
  hideClass: { popup: "animate__animated animate__fadeOut animate__faster" },
};

const toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
  customClass: { popup: "salon-swal-toast" },
});

export const alerts = {
  success: (title: string, text?: string) =>
    toast.fire({ icon: "success", title, text }),

  error: (title: string, text?: string) =>
    Swal.fire({ ...base, icon: "error", title, text, confirmButtonText: "حسناً" }),

  info: (title: string, text?: string) =>
    toast.fire({ icon: "info", title, text }),

  async confirm(title: string, text?: string, confirmText = "نعم، احذف", cancelText = "إلغاء") {
    const r = await Swal.fire({
      ...base,
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      focusCancel: true,
    });
    return r.isConfirmed;
  },

  async booked(date: string, time: string, phone: string) {
    return Swal.fire({
      ...base,
      icon: "success",
      title: "تم تأكيد حجزك!",
      html: `<div style="text-align:center"><div style="margin-bottom:6px">${date} — ${time}</div><div style="color:var(--muted-foreground);font-size:13px">سنتواصل معك على ${phone}</div></div>`,
      confirmButtonText: "تمام",
      timer: 3500,
      timerProgressBar: true,
    });
  },
};
