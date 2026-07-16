/**
 * Custom Accessible Icon Selector Dropdown Component (`IconPicker.tsx`)
 * ---------------------------------------------------------------------
 * Demonstrates accessible custom form controls with click-outside resolution,
 * glassmorphism styling, and dynamic icon preview rendering.
 */

import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCode, FaReact, FaPython, FaNodeJs, FaDatabase, FaBrain } from "react-icons/fa";

// Sample icon catalog mapped for demonstration
const SAMPLE_ICONS = [
  { name: "FaReact", icon: FaReact },
  { name: "FaPython", icon: FaPython },
  { name: "FaNodeJs", icon: FaNodeJs },
  { name: "FaDatabase", icon: FaDatabase },
  { name: "FaBrain", icon: FaBrain },
  { name: "FaCode", icon: FaCode },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export default function IconPicker({ value, onChange, label = "Icon", required = false }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the component boundary
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = SAMPLE_ICONS.find((i) => i.name === value) || SAMPLE_ICONS[0];
  const SelectedIcon = selectedOption.icon;

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="text-white font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white flex items-center justify-between hover:border-cyan-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <SelectedIcon className="text-xl text-cyan-400" />
            <span>{selectedOption.name}</span>
          </div>
          <FaChevronDown className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl max-h-64 overflow-y-auto z-[9999] shadow-2xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SAMPLE_ICONS.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => {
                  onChange(option.name);
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg gap-2 transition-colors ${
                  value === option.name 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                    : 'text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                <option.icon className="text-2xl" />
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
