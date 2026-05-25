import { Menu, X, Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button removed since sidebar is always visible on desktop */}
        <div className="hidden lg:block" />
        
        {/* Search or breadcrumbs could go here */}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
        </button>

        {/* Profile dropdown placeholder */}
        <button 
          onClick={() => navigate("/auth/profile")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <User size={18} />
          <span className="hidden md:inline">Profile</span>
        </button>

        {/* Logout */}
        <button 
          onClick={() => navigate("/auth/login")}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
