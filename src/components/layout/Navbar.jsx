import { useState } from "react";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden h-9 w-64 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, events..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 flex size-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          <span className="sr-only">Notifications</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 focus:outline-none"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 shadow-sm transition-transform hover:scale-105">
              <User size={18} />
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-slate-900">Dr. Smith</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                >
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-medium text-slate-900">John Doe</p>
                    <p className="text-xs text-slate-500">j.doe@medicore.com</p>
                  </div>
                  <div className="py-1">
                    <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700">
                      <User size={16} className="text-slate-400 group-hover:text-cyan-600" />
                      Profile
                    </button>
                    <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700">
                      <Settings size={16} className="text-slate-400 group-hover:text-cyan-600" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                      <LogOut size={16} className="text-rose-400 group-hover:text-rose-600" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
