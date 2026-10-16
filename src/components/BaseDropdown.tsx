"use client";

import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: ReactNode;
}

interface BaseDropdownProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: ReactNode;
  label?: ReactNode;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function BaseDropdown<T extends string = string>({
  value,
  options,
  onChange,
  placeholder,
  label,
  id,
  name,
  disabled = false,
  className = "",
  ariaLabel,
}: BaseDropdownProps<T>) {
  const generatedId = useId();
  const dropdownId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") setOpen(false);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((isOpen) => !isOpen);
    }
  };

  const selectOption = (nextValue: T) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleOptionTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleOptionTouchEnd = (nextValue: T, event: React.TouchEvent<HTMLButtonElement>) => {
    const touch = event.changedTouches[0];
    const start = touchStartRef.current;
    touchStartRef.current = null;
    // Only treat a tap as a selection; a finger moving through the list is scrolling.
    if (start && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) < 10) {
      event.preventDefault();
      selectOption(nextValue);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${open ? "z-50" : "z-0"} ${className}`}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="mb-1.5 block text-xs font-medium text-foreground sm:mb-2 sm:text-sm"
        >
          {label}
        </label>
      )}
      <button
        id={dropdownId}
        name={name}
        type="button"
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-100 sm:px-4 sm:py-2.5 sm:text-sm"
      >
        <span className={selectedOption ? "text-foreground" : "text-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-3 h-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {placeholder !== undefined && (
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onTouchStart={handleOptionTouchStart}
              onTouchEnd={(event) => handleOptionTouchEnd("" as T, event)}
              onClick={() => selectOption("" as T)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 ${value === "" ? "bg-accent/10 text-accent font-medium" : "text-muted"}`}
            >
              {placeholder}
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onTouchStart={handleOptionTouchStart}
              onTouchEnd={(event) => handleOptionTouchEnd(option.value, event)}
              onClick={() => selectOption(option.value)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 ${option.value === value ? "bg-accent/10 text-accent font-medium" : "text-foreground"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
