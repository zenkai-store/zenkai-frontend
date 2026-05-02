import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../api/api.js";
import Logo from "../assets/MM_Logo.png";
import {
  LayoutDashboard,
  Package,
  User,
  Layers,
  HelpCircle,
  MessagesSquare,
  LogOut,
  ChevronDown,
  Building,
  List,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  MessageSquare,
  PlusCircle,
  TicketPercent,
  CirclePercent,
  MessageSquareDiff,
  Percent,
  ShoppingCart,
} from "lucide-react";

const Staff = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // Expandable menu states
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    brands: false,
    category: false,
    orders: false,
    profile: false,
    support: false,
    orderchat: false,
    discount: false,
  });

  // Toggle menu function
  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // STAFF LOGOUT
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const token = localStorage.getItem("mm_staff_token");

      // If no token, directly logout
      if (!token) {
        localStorage.removeItem("mm_staff_token");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/auth/staff-logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Clear token
      if (response.data.success) {
        localStorage.removeItem("mm_staff_token");
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("mm_staff_token");
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      id: "dashboard",
      to: "/staff/dashboard",
      end: true,
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const expandableMenus = [
    {
      id: "orders",
      label: "Orders",
      icon: <Package size={20} />,
      expanded: expandedMenus.orders,
      items: [
        {
          to: "/staff/orders/all",
          label: "All Orders",
          icon: <List size={16} />,
        },
        {
          to: "/staff/orders/pending",
          label: "Pending Orders",
          icon: <Clock size={16} />,
        },
        {
          to: "/staff/orders/completed",
          label: "Completed Orders",
          icon: <CheckCircle size={16} />,
        },
      ],
    },
    {
      id: "products",
      label: "Products",
      icon: <ShoppingCart size={20} />,
      expanded: expandedMenus.products,
      items: [
        { to: "/products", label: "List Products", icon: <List size={16} /> },
        { to: "/variants", label: "List Variants", icon: <Layers size={16} /> },
      ],
    },
    {
      id: "brands",
      label: "Brands",
      icon: <Building size={20} />,
      expanded: expandedMenus.brands,
      items: [
        { to: "/brands", label: "List Brands", icon: <List size={16} /> },
        { to: "/variants", label: "Future Update", icon: <Clock size={16} /> },
      ],
    },
    {
      id: "category",
      label: "Categories",
      icon: <Layers size={20} />,
      expanded: expandedMenus.category,
      items: [
        {
          to: "/categories/list",
          label: "List Categories",
          icon: <List size={16} />,
        },
        {
          to: "/segments/list",
          label: "List Segments",
          icon: <List size={16} />,
        },
      ],
    },
    {
      id: "discount",
      label: "Discounts",
      icon: <Percent size={20} />,
      expanded: expandedMenus.discount,
      items: [
        {
          to: "/discounts/coupon",
          label: "Coupon Discounts",
          icon: <TicketPercent size={16} />,
        },
        {
          to: "/discounts/manual",
          label: "Manual Discounts",
          icon: <CirclePercent size={16} />,
        },
      ],
    },
    {
      id: "orderchat",
      label: "Order-Chat",
      icon: <MessagesSquare size={20} />,
      expanded: expandedMenus.orderchat,
      items: [
        {
          to: "/categories/list",
          label: "List Order-Chats",
          icon: <List size={16} />,
        },
        {
          to: "/segments/list",
          label: "Create Order-Chat",
          icon: <MessageSquareDiff size={16} />,
        },
      ],
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={20} />,
      expanded: expandedMenus.profile,
      items: [
        {
          to: "/staff/profile",
          label: "View Profile",
          icon: <Eye size={16} />,
        },
        {
          to: "/staff/profile/edit",
          label: "Edit Profile",
          icon: <Edit size={16} />,
        },
      ],
    },
    {
      id: "support",
      label: "Support Center",
      icon: <HelpCircle size={20} />,
      expanded: expandedMenus.support,
      items: [
        {
          to: "/staff/support/mytickets",
          label: "My Tickets",
          icon: <MessageSquare size={16} />,
        },
        {
          to: "/staff/support/all",
          label: "List Tickets",
          icon: <PlusCircle size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-blue-50/30 to-white font-lufga">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col z-50">
        {/* HEADER */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={Logo}
                className="w-12 h-12 object-contain drop-shadow-sm"
                alt="Modern Mahal Logo"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 tracking-tight">
                Modern Mahal
              </h4>
              <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                Staff Panel
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION CONTAINER WITH SCROLL */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <nav className="space-y-1 px-4">
            {/* MAIN NAV ITEMS */}
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`
                }
              >
                <span
                  className={({ isActive }) =>
                    isActive ? "text-blue-600" : "text-gray-400"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}

            {/* EXPANDABLE MENUS */}
            {expandableMenus.map((menu) => (
              <div key={menu.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                    ${
                      menu.expanded
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        menu.expanded ? "text-blue-600" : "text-gray-400"
                      }
                    >
                      {menu.icon}
                    </span>
                    {menu.label}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      menu.expanded
                        ? "rotate-180 text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* SUBMENU ITEMS */}
                <div
                  className={`transition-all duration-300 overflow-hidden ml-4 border-l border-blue-100 pl-3
                    ${
                      menu.expanded
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                >
                  {menu.items.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 my-1 rounded-lg transition-all duration-200 text-sm
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium border border-blue-100"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`
                      }
                    >
                      <span
                        className={({ isActive }) =>
                          isActive ? "text-blue-600" : "text-gray-400"
                        }
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl 
              bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 
              transition-all duration-200 text-blue-700 font-semibold shadow-sm hover:shadow-md
              border border-blue-100 hover:border-blue-200
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3 px-2">
            Staff Access • Restricted Mode
          </p>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="ml-64 w-[calc(100%-16rem)] h-full overflow-y-auto bg-gradient-to-b from-white to-blue-50/20">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Staff;
