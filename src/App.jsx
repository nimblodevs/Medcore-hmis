import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import PatientRegistration from "./pages/Patient/RegistrationForm";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

const queryClient = new QueryClient();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("patients");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar 
          isOpen={isSidebarOpen} 
          activePage={activePage} 
          onPageChange={(page) => {
            setActivePage(page);
            setIsSidebarOpen(false);
          }}
        />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar 
            onMenuClick={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {activePage === "patients" ? (
                <PatientRegistration />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 capitalize">{activePage}</h2>
                    <p className="text-slate-500">This module is part of the restore point and will be fully available soon.</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
