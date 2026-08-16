import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BASEURL from "../config/baseURL";
import Logo from "../assets/logo.png";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Building,
  Layers,
  UserCog,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Percent,
  MessagesSquare,
  MessageSquareDiff,
  SquareActivity,
  TicketPercent,
  CirclePercent,
  List,
  UserPlus,
  Shield,
  Network,
  Clock,
  Globe,
  Home,
  TrendingUp,
  DollarSign,
  Settings,
  Bell,
  Search,
  Highlighter,
  CirclePlus,
} from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [searchQuery, setSearchQuery] = useState("");

  // Expandable menu states
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    expense: false,
    categories: false,
    staff: false,
    logs: false,
    discount: false,
    features: false,
    support: false,
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAdminAuth = () => {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
      };

      const adminToken = getCookie("adminToken");
      const adminLoggedIn = localStorage.getItem("adminLoggedIn");

      if (!adminToken && adminLoggedIn !== "true") {
        navigate("/admin/login");
        return;
      }

      // Get admin name from localStorage if available
      const storedAdmin = localStorage.getItem("adminData");
      if (storedAdmin) {
        try {
          const adminData = JSON.parse(storedAdmin);
          setAdminName(adminData.name || adminData.email || "Admin");
        } catch (error) {
          console.error("Error parsing admin data:", error);
        }
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Toggle menu function
  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Auto-expand menu based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    if (
      currentPath.includes("/products") ||
      currentPath.includes("/variants")
    ) {
      setExpandedMenus((prev) => ({ ...prev, products: true }));
    }
    if (currentPath.includes("/expense")) {
      setExpandedMenus((prev) => ({ ...prev, expense: true }));
    }
    if (
      currentPath.includes("/categories") ||
      currentPath.includes("/segments")
    ) {
      setExpandedMenus((prev) => ({ ...prev, categories: true }));
    }
    if (currentPath.includes("/discounts")) {
      setExpandedMenus((prev) => ({ ...prev, discount: true }));
    }
    if (currentPath.includes("/featured")) {
      setExpandedMenus((prev) => ({ ...prev, features: true }));
    }
    if (currentPath.includes("/admin/staff")) {
      setExpandedMenus((prev) => ({ ...prev, staff: true }));
    }
    if (currentPath.includes("/admin/ips")) {
      setExpandedMenus((prev) => ({ ...prev, logs: true }));
    }
    if (currentPath.includes("/support")) {
      setExpandedMenus((prev) => ({ ...prev, support: true }));
    }
  }, [location.pathname]);

  // LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      // Call backend logout endpoint
      try {
        await axios.post(
          `${BASEURL}/api/admin/logout`,
          {},
          { withCredentials: true },
        );
      } catch (error) {
        console.error("Backend logout error:", error);
      }

      // Clear localStorage
      localStorage.removeItem("adminData");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("zenkai_admin_token");
      localStorage.removeItem("mm_admin_token");

      // Clear cookie
      document.cookie =
        "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirect to login
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API fails
      localStorage.clear();
      document.cookie =
        "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/admin/login";
    } finally {
      setLoggingOut(false);
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      id: "dashboard",
      to: "/admin",
      end: true,
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "orders",
      to: "/admin/orders/list",
      label: "Orders",
      icon: <ShoppingBag size={20} />,
    },
    {
      id: "users",
      to: "/admin/users",
      label: "Customers",
      icon: <Users size={20} />,
    },
    {
      id: "analytics",
      to: "/admin/analytics",
      label: "Analytics",
      icon: <TrendingUp size={20} />,
    },
  ];

  const expandableMenusConfig = [
    {
      id: "products",
      label: "Products",
      icon: <Package size={20} />,
      expanded: expandedMenus.products,
      items: [
        {
          to: "/admin/products/list",
          label: "All Products",
          icon: <List size={16} />,
        },
        {
          to: "/admin/products/add",
          label: "Add Product",
          icon: <Package size={16} />,
        },
        {
          to: "/admin/variants",
          label: "Variants",
          icon: <Layers size={16} />,
        },
      ],
    },
    {
      id: "expense",
      label: "Expenses",
      icon: <Building size={20} />,
      expanded: expandedMenus.expense,
      items: [
        {
          to: "/admin/expense/list",
          label: "All Expenses",
          icon: <List size={16} />,
        },
        {
          to: "/admin/expense/add",
          label: "Add Expenses",
          icon: <Building size={16} />,
        },
      ],
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Layers size={20} />,
      expanded: expandedMenus.categories,
      items: [
        {
          to: "/admin/categories/list",
          label: "Categories",
          icon: <List size={16} />,
        },
        {
          to: "/admin/segments/list",
          label: "Segments",
          icon: <Layers size={16} />,
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
          to: "/admin/discounts/coupons",
          label: "Coupons",
          icon: <TicketPercent size={16} />,
        },
        {
          to: "/admin/discounts/manual",
          label: "Manual Discounts",
          icon: <CirclePercent size={16} />,
        },
        {
          to: "/admin/discounts/activity",
          label: "Activity Log",
          icon: <SquareActivity size={16} />,
        },
      ],
    },
    {
      id: "features",
      label: "Featured",
      icon: <Highlighter size={20} />,
      expanded: expandedMenus.features,
      items: [
        {
          to: "/admin/featured/arrivals/list",
          label: "New Arrivals",
          icon: <CirclePlus size={16} />,
        },
        {
          to: "/admin/chats/assigned",
          label: "Assigned to Me",
          icon: <MessageSquareDiff size={16} />,
        },
      ],
    },
    {
      id: "staff",
      label: "Staff",
      icon: <UserCog size={20} />,
      expanded: expandedMenus.staff,
      items: [
        {
          to: "/admin/staff/list",
          label: "All Staff",
          icon: <Users size={16} />,
        },
        {
          to: "/admin/staff/roles",
          label: "Roles & Permissions",
          icon: <Shield size={16} />,
        },
        {
          to: "/admin/staff/register",
          label: "Add Staff",
          icon: <UserPlus size={16} />,
        },
      ],
    },
    {
      id: "logs",
      label: "Security Logs",
      icon: <FileText size={20} />,
      expanded: expandedMenus.logs,
      items: [
        {
          to: "/admin/ips/allowed",
          label: "Allowed IPs",
          icon: <Globe size={16} />,
        },
        {
          to: "/admin/ips/pending",
          label: "Pending Requests",
          icon: <Clock size={16} />,
        },
        {
          to: "/admin/ips/staff",
          label: "Staff IPs",
          icon: <Network size={16} />,
        },
      ],
    },
    {
      id: "support",
      label: "Support",
      icon: <HelpCircle size={20} />,
      expanded: expandedMenus.support,
      items: [
        {
          to: "/admin/support/tickets",
          label: "Tickets",
          icon: <HelpCircle size={16} />,
        },
        {
          to: "/admin/support/faq",
          label: "FAQ",
          icon: <FileText size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-gray-900 to-black font-lufga overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 shadow-2xl flex flex-col z-50 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* HEADER */}
        <div
          className={`px-4 py-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black ${sidebarCollapsed ? "px-2" : "px-6"}`}
        >
          <div
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="relative">
              <img
                src={Logo}
                className={`object-contain drop-shadow-lg transition-all duration-300 ${
                  sidebarCollapsed ? "w-10 h-10" : "w-12 h-12"
                }`}
                alt="Modern Mahal Logo"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full border-2 border-gray-900"></div>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Zenkai.co
                </h4>
                <p className="text-xs text-gray-400 font-medium">
                  Admin Panel v2.0
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ADMIN PROFILE QUICK INFO */}
        {!sidebarCollapsed && (
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center text-white font-bold">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{adminName}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
              <button className="text-gray-400 hover:text-white transition">
                <Settings size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>
        )}

        {/* NAVIGATION CONTAINER WITH SCROLL */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
          <nav className={`space-y-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
            {/* MAIN NAV ITEMS */}
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-red-500/20 to-pink-600/20 text-white border-l-2 border-red-500"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                  ${sidebarCollapsed ? "justify-center" : ""}`
                }
              >
                <span
                  className={({ isActive }) =>
                    isActive ? "text-red-500" : "text-gray-500"
                  }
                >
                  {item.icon}
                </span>
                {!sidebarCollapsed && item.label}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}

            <div className="my-4 border-t border-gray-800"></div>

            {/* EXPANDABLE MENUS */}
            {expandableMenusConfig.map((menu) => (
              <div key={menu.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative group
                    ${
                      menu.expanded
                        ? "bg-gradient-to-r from-red-500/20 to-pink-600/20 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }
                    ${sidebarCollapsed ? "justify-center" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        menu.expanded ? "text-red-500" : "text-gray-500"
                      }
                    >
                      {menu.icon}
                    </span>
                    {!sidebarCollapsed && menu.label}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        menu.expanded
                          ? "rotate-180 text-red-500"
                          : "text-gray-500"
                      }`}
                    />
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                      {menu.label}
                    </div>
                  )}
                </button>

                {/* SUBMENU ITEMS */}
                {!sidebarCollapsed && (
                  <div
                    className={`transition-all duration-300 overflow-hidden ml-4 border-l border-gray-700 pl-3
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
                              ? "bg-red-500/10 text-red-500 font-medium border-l-2 border-red-500"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                          }`
                        }
                      >
                        <span
                          className={({ isActive }) =>
                            isActive ? "text-red-500" : "text-gray-500"
                          }
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* BOTTOM ACTIONS */}
        <div
          className={`p-4 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-black ${sidebarCollapsed ? "px-2" : ""}`}
        >
          {/* Home Button */}
          <NavLink
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white mb-2 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <Home size={20} />
            {!sidebarCollapsed && "Back to Site"}
          </NavLink>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`w-full flex items-center gap-3 py-3.5 rounded-xl 
              bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700
              transition-all duration-200 text-white font-semibold shadow-lg hover:shadow-red-500/25
              disabled:opacity-70 disabled:cursor-not-allowed
              ${sidebarCollapsed ? "justify-center px-2" : "px-4"}`}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && (loggingOut ? "Logging out..." : "Logout")}
          </button>

          {!sidebarCollapsed && (
            <p className="text-xs text-gray-500 text-center mt-3">
              © 2024 Zenkai.co
            </p>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronDown size={14} className="rotate-90" />
          )}
        </button>
      </aside>

      {/* CONTENT AREA */}
      <main
        className={`flex-1 h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-black transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {location.pathname
                  .split("/")
                  .pop()
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, {adminName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Date Display */}
              <div className="text-right hidden md:block">
                <p className="text-white text-sm font-medium">
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Admin;
