import { PropsWithChildren } from "react";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
}

export default function Modal({ title, open, onClose, footer, children }: PropsWithChildren<ModalProps>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="border-t border-slate-200 p-5">{footer}</div> : null}
      </div>
    </div>
  );
}
