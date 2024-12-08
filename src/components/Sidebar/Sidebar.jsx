import React, { useState, useEffect } from "react";
import {
  FiBarChart,
  FiChevronsRight,
  FiHome,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { AiFillAlert } from "react-icons/ai";
import { motion } from "framer-motion";
import RedCrossLogo from "../../assets/Logo.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { getMe } from "../../services/userService";
import { useEmergencyNotification } from "../../context/emergencyNotificationContext";
import { TiLocation } from "react-icons/ti";
import { FaWpforms } from "react-icons/fa6";
import { MdAttachMoney } from "react-icons/md";
import { MdBloodtype } from "react-icons/md";
import { CiLogout } from "react-icons/ci";

const Sidebar = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("emergencies");
  const [user, setUser] = useState(null);
  const { emergencyCount } = useEmergencyNotification();
  useEffect(() => {
    getMe().then((data) => setUser(data));
    const path = window.location.pathname.split("/")[1];
    setSelected(path.toUpperCase().slice(0, 1) + path.slice(1));
  }, []);

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection open={open} user={user} />

      <div className="space-y-1">
        <Option
          Icon={AiFillAlert}
          title="Emergencies"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={emergencyCount === 0 ? null : emergencyCount}
          path="/emergencies"
        />
        <Option
          Icon={FiBarChart}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/analytics"
        />
        {(user?.role?.toLowerCase() === "admin" ||
          user?.role?.toLowerCase() === "supervisor") && (
          <>
            <Option
              Icon={TiLocation}
              title="Branches"
              selected={selected}
              setSelected={setSelected}
              open={open}
              path="/branches"
            />

            <Option
              Icon={FaWpforms}
              title="Applications"
              selected={selected}
              setSelected={setSelected}
              open={open}
              path="/applications"
            />
          </>
        )}
        <Option
          Icon={MdAttachMoney}
          title="Donations"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/donations"
        />
        <Option
          Icon={MdBloodtype}
          title="Blood Requests"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/blood-requests"
        />

        {(user?.role?.toLowerCase() === "admin" ||
          user?.role?.toLowerCase() === "supervisor") && (
          <Option
            Icon={FiUsers}
            title="Users"
            selected={selected}
            setSelected={setSelected}
            open={open}
            path="/users"
          />
        )}
        <Option
          Icon={FiSettings}
          title="Settings"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/settings"
        />
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-white"
          >
            <CiLogout />
            {open && "Logout"}
          </button>
        </div>
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs, path }) => {
  return (
    <motion.button
      layout
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title
          ? "bg-indigo-100 text-indigo-800"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <Link
        to={path}
        className="flex items-center w-full"
        onClick={() => setSelected(title)}
      >
        <motion.div
          layout
          className="grid h-full w-10 place-content-center text-lg"
        >
          <Icon />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            {title}
          </motion.span>
        )}
      </Link>
      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open, user }) => {
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold">
                {user?.fullName}
              </span>
              <span className="block text-xs text-slate-500">
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md bg-slate-300"
    >
      <img src={RedCrossLogo} alt="logo" className="w-7" />
    </motion.div>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg"
        >
          <FiChevronsRight
            className={`transition-transform ${open && "rotate-180"}`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Hide
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

export default Sidebar;
