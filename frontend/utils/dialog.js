import Swal from 'sweetalert2'

/**
 * Konfigurasi SweetAlert2 bertema Re.juve (Compact, Sleek, Modern)
 */
const RejuveSwal = Swal.mixin({
  width: '380px',
  customClass: {
    popup: '!rounded-2xl !p-5 !border !border-slate-200/90 dark:!border-slate-800 dark:!bg-slate-900 !shadow-2xl',
    title: '!text-base !font-bold !text-slate-900 dark:!text-white !pt-1',
    htmlContainer: '!text-xs !text-slate-500 dark:!text-slate-400 !mt-1.5 !mb-3',
    confirmButton: '!px-4 !py-2 !rounded-xl !text-xs !font-semibold !shadow-sm !transition-all !cursor-pointer',
    cancelButton: '!px-4 !py-2 !rounded-xl !text-xs !font-semibold !transition-all !cursor-pointer !border !border-slate-300 dark:!border-slate-700'
  },
  buttonsStyling: false,
  didOpen: (popup) => {
    const container = Swal.getContainer()
    if (container) {
      container.style.pointerEvents = 'auto'
    }
    if (popup) {
      popup.style.pointerEvents = 'auto'
    }
  }
})

/**
 * Dialog konfirmasi penghapusan data (Ukuran Compact & Ramping)
 */
export async function confirmDeleteDialog({
  title = 'Hapus Data?',
  text = 'Data yang dihapus tidak dapat dikembalikan.',
  confirmButtonText = 'Ya, Hapus',
  cancelButtonText = 'Batal'
} = {}) {
  const result = await RejuveSwal.fire({
    title,
    text,
    icon: 'warning',
    iconColor: '#e11d48',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: '!rounded-2xl !p-5 !border !border-slate-200/90 dark:!border-slate-800 dark:!bg-slate-900 !shadow-2xl',
      title: '!text-base !font-bold !text-slate-900 dark:!text-white !pt-1',
      htmlContainer: '!text-xs !text-slate-500 dark:!text-slate-400 !mt-1.5 !mb-3',
      confirmButton: '!bg-rose-600 hover:!bg-rose-700 !text-white !px-4 !py-2 !rounded-xl !text-xs !font-semibold !shadow-sm !ml-2 !cursor-pointer',
      cancelButton: '!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-700 dark:!text-slate-300 !px-4 !py-2 !rounded-xl !text-xs !font-semibold !cursor-pointer'
    }
  })

  return result.isConfirmed
}

/**
 * Dialog konfirmasi aksi umum (Ukuran Compact & Ramping)
 */
export async function confirmActionDialog({
  title = 'Konfirmasi Aksi',
  text = 'Apakah Anda yakin ingin melanjutkan?',
  icon = 'question',
  confirmButtonText = 'Lanjutkan',
  cancelButtonText = 'Batal'
} = {}) {
  const result = await RejuveSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: '!rounded-2xl !p-5 !border !border-slate-200/90 dark:!border-slate-800 dark:!bg-slate-900 !shadow-2xl',
      title: '!text-base !font-bold !text-slate-900 dark:!text-white !pt-1',
      htmlContainer: '!text-xs !text-slate-500 dark:!text-slate-400 !mt-1.5 !mb-3',
      confirmButton: '!bg-[#831843] hover:!bg-[#6b133a] !text-white !px-4 !py-2 !rounded-xl !text-xs !font-semibold !shadow-sm !ml-2 !cursor-pointer',
      cancelButton: '!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-700 dark:!text-slate-300 !px-4 !py-2 !rounded-xl !text-xs !font-semibold !cursor-pointer'
    }
  })

  return result.isConfirmed
}

export default RejuveSwal
