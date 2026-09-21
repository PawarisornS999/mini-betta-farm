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
}: BaseDropdownProps<T>) {
  const generatedId = useId();
  const dropdownId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="text-sm font-medium text-foreground block mb-2"
        >
          {label}
        </label>
      )}
      <button
        id={dropdownId}
        name={name}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-left transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-100"
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
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
        >
          {placeholder !== undefined && (
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
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
