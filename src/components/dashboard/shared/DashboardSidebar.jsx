import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import logoZayid from "../../../assets/icons/logo-zayid.png";

const DashboardSidebar = ({
  menuItems,
  activeMenu,
  setActiveMenu,
  handleLogout,
}) => {
  return (
    <aside className="bg-white rounded-xl border border-[#E5E7EB] hidden lg:block w-72 shrink-0 min-h-[600px]">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#E5E7EB] flex justify-center items-center">
        <img src={logoZayid} alt="Zayid Logo" className="h-12 object-contain" />
      </div>

      <div className="p-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`flex flex-row-reverse items-center justify-end rounded-lg px-4 py-3 text-base font-medium transition-colors w-full text-right border ${
              activeMenu === item.id
                ? "bg-[#FFF6F1] text-[#FA6300] border-[#FA6300]"
                : "bg-[#F3F4F6] text-[#2D3142] border-transparent hover:bg-[#E5E7EB]"
            }`}
          >
            <span>{item.name}</span>
            <item.icon className="w-5 h-5 ml-2" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="flex flex-row-reverse items-center justify-end rounded-lg px-4 py-3 text-base font-medium transition-colors w-full text-right border bg-[#F3F4F6] text-red-600 border-transparent hover:bg-red-50"
        >
          <span>تسجيل الخروج</span>
          <FaSignOutAlt className="w-5 h-5 ml-2" />
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
