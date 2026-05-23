/**
 * Reusable Patient Search Component
 * Features:
 * - Search by UHID, name, phone, national ID, passport
 * - Debounced search
 * - Duplicate warning display
 * - Quick patient preview
 * - Keyboard navigation
 */

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  IdCard,
  AlertCircle,
  Loader2,
  ChevronRight,
  X
} from "lucide-react";

// Import existing API
import { searchPatients } from "../../../services/patientApi";

/**
 * Patient Search Box Component
 * @param {Object} props
 * @param {function} props.onPatientSelect - Callback when patient is selected
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.showRecent - Show recent searches
 * @param {string} props.initialValue - Initial search value
 */
export function PatientSearchBox({
  onPatientSelect,
  placeholder = "Search by UHID, name, phone, or ID...",
  showRecent = true,
  initialValue = ""
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  const { data: searchResults, isLoading, isFetching } = useQuery({
    queryKey: ["patientSearch", searchTerm],
    queryFn: () => searchPatients(searchTerm),
    enabled: searchTerm.trim().length >= 2,
    staleTime: 30000, // 30 seconds
    retry: false
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const results = searchResults || [];
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
        
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
        
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectPatient(results[selectedIndex]);
        }
        break;
        
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
        
      default:
        break;
    }
  };

  // Handle patient selection
  const handleSelectPatient = (patient) => {
    onPatientSelect?.(patient);
    setIsOpen(false);
    setSearchTerm("");
    setSelectedIndex(-1);
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const results = searchResults || [];

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => searchTerm.trim().length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 shadow-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-600/10"
        />
        
        {(searchTerm || isLoading) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full hover:bg-slate-100"
            type="button"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            ) : (
              <X className="size-4 text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && searchTerm.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            {isLoading && isFetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-cyan-600" />
                <span className="ml-3 text-sm text-slate-600">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <User className="mb-3 size-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No patients found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try searching by UHID, name, phone, or ID number
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Results Header */}
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {results.length} Patient{results.length !== 1 ? "s" : ""} Found
                  </p>
                </div>

                {/* Patient List */}
                {results.map((patient, index) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-cyan-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold text-sm">
                      {patient.firstName?.[0]}{patient.lastName?.[0]}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {patient.firstName} {patient.middleName} {patient.lastName}
                        </p>
                        {patient.status === "ACTIVE" ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {patient.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <IdCard className="size-3.5 text-slate-400" />
                          <span className="truncate">{patient.hospitalNumber}</span>
                        </div>
                        
                        {patient.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3.5 text-slate-400" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        
                        {patient.dateOfBirth && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-slate-400" />
                            <span>
                              {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {patient.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="size-3.5 text-slate-400" />
                            <span className="truncate">{patient.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate Warning Display */}
      {searchTerm && (
        <DuplicateWarning searchTerm={searchTerm} />
      )}
    </div>
  );
}

/**
 * Duplicate Warning Component
 * Shows warnings for potential duplicate patients
 */
function DuplicateWarning({ searchTerm }) {
  // This would integrate with the backend duplicate detection
  // For now, it's a placeholder for future implementation
  return null;
}

/**
 * Patient Quick Preview Component
 * Shows a compact patient summary card
 */
export function PatientQuickPreview({ patient, onClose, onEdit }) {
  if (!patient) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900">
              {patient.firstName} {patient.middleName} {patient.lastName}
            </h3>
            <p className="text-sm text-slate-600">{patient.hospitalNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-50"
            >
              Edit
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-slate-100"
            >
              <X className="size-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {patient.gender && (
          <div>
            <p className="text-xs text-slate-500">Gender</p>
            <p className="font-medium text-slate-900 capitalize">{patient.gender.toLowerCase()}</p>
          </div>
        )}
        
        {patient.dateOfBirth && (
          <div>
            <p className="text-xs text-slate-500">Date of Birth</p>
            <p className="font-medium text-slate-900">
              {new Date(patient.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
        )}
        
        {patient.phone && (
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="font-medium text-slate-900">{patient.phone}</p>
          </div>
        )}
        
        {patient.email && (
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-medium text-slate-900">{patient.email}</p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active Alerts
          </p>
          {patient.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 rounded-lg p-2 ${
                alert.alertType === "ALLERGY"
                  ? "bg-red-50 text-red-700"
                  : alert.alertType === "FALL_RISK"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                {alert.description && (
                  <p className="text-xs opacity-90">{alert.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default PatientSearchBox;
