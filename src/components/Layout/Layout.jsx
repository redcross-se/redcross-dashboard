import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
