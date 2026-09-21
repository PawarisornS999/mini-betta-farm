"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleXmark,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export type ModalVariant = "success" | "fail" | "warning" | "error";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
}

const variantConfig = {
  success: {
    icon: faCircleCheck,
    color: "text-green-500",
    button: "bg-green-500 hover:bg-green-600",
  },
  fail: {
    icon: faCircleXmark,
    color: "text-red-500",
    button: "bg-red-500 hover:bg-red-600",
  },
  warning: {
    icon: faTriangleExclamation,
    color: "text-amber-500",
    button: "bg-amber-500 hover:bg-amber-600",
  },
  error: {
    icon: faCircleExclamation,
    color: "text-red-500",
    button: "bg-red-500 hover:bg-red-600",
  },
};

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ModalProps) {
  const config = variantConfig[variant];

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close modal"
            className="absolute inset-0 cursor-default bg-black/50"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-foreground"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${config.color} bg-opacity-10`}
            >
              <FontAwesomeIcon icon={config.icon} className="h-6 w-6" />
            </div>
            <h2 id="modal-title" className="text-xl font-bold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-muted">{description}</p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-muted hover:bg-gray-50"
              >
                {cancelText}
              </button>
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors ${config.button}`}
                >
                  {confirmText}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
