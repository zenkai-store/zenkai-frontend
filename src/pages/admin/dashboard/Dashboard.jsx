import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Star,
  Clock,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Calendar,
  ChevronRight,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("today");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 45890,
    totalOrders: 1250,
    totalCustomers: 3847,
    totalProducts: 856,
    conversionRate: 3.2,
  });

  // Sample data - Will be replaced with API calls
  const [recentOrders, setRecentOrders] = useState([
    {
      id: "#ORD-2024-001",
      customer: "John Doe",
      product: "Wooden Katana",
      amount: 240,
      status: "completed",
      date: "2024-01-15",
      paymentMethod: "Credit Card",
    },
    {
      id: "#ORD-2024-002",
      customer: "Jane Smith",
      product: "Samurai Sword Set",
      amount: 890,
      status: "processing",
      date: "2024-01-15",
      paymentMethod: "PayPal",
    },
    {
      id: "#ORD-2024-003",
      customer: "Mike Johnson",
      product: "Kunai Collection",
      amount: 180,
      status: "pending",
      date: "2024-01-14",
      paymentMethod: "Credit Card",
    },
    {
      id: "#ORD-2024-004",
      customer: "Sarah Williams",
      product: "Diecast Model Car",
      amount: 560,
      status: "completed",
      date: "2024-01-14",
      paymentMethod: "Bank Transfer",
    },
    {
      id: "#ORD-2024-005",
      customer: "Alex Brown",
      product: "Gaming Headset",
      amount: 320,
      status: "shipped",
      date: "2024-01-13",
      paymentMethod: "Credit Card",
    },
  ]);

  const [bestSellingProducts, setBestSellingProducts] = useState([
    {
      id: 1,
      name: "Wooden Katana",
      sales: 234,
      revenue: 56160,
      growth: 12.5,
      image:
        "https://images.unsplash.com/photo-1581783898377-1c85e5c5f2f9?w=100&h=100&fit=crop",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Samurai Sword Set",
      sales: 187,
      revenue: 166430,
      growth: 8.3,
      image:
        "https://images.unsplash.com/photo-1581783898377-1c85e5c5f2f9?w=100&h=100&fit=crop",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Diecast Model Car",
      sales: 156,
      revenue: 87360,
      growth: -2.1,
      image:
        "https://images.unsplash.com/photo-1581783898377-1c85e5c5f2f9?w=100&h=100&fit=crop",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Gaming Headset Pro",
      sales: 142,
      revenue: 45440,
      growth: 15.7,
      image:
        "https://images.unsplash.com/photo-1581783898377-1c85e5c5f2f9?w=100&h=100&fit=crop",
      rating: 4.6,
    },
    {
      id: 5,
      name: "Kunai Collection",
      sales: 98,
      revenue: 17640,
      growth: 5.2,
      image:
        "https://images.unsplash.com/photo-1581783898377-1c85e5c5f2f9?w=100&h=100&fit=crop",
      rating: 4.5,
    },
  ]);

  const [salesData, setSalesData] = useState({
    daily: [4200, 3800, 5100, 4900, 6200, 5800, 7100],
    weekly: [28500, 31200, 29800, 34500],
    monthly: [125000, 142000, 138000, 156000, 149000, 168000],
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "order",
      message: "New order #ORD-2024-006 placed",
      time: "5 minutes ago",
      icon: <ShoppingBag className="w-4 h-4" />,
      color: "blue",
    },
    {
      id: 2,
      type: "user",
      message: "New customer registered",
      time: "15 minutes ago",
      icon: <Users className="w-4 h-4" />,
      color: "green",
    },
    {
      id: 3,
      type: "product",
      message: "Product stock updated: Wooden Katana",
      time: "1 hour ago",
      icon: <Package className="w-4 h-4" />,
      color: "purple",
    },
    {
      id: 4,
      type: "order",
      message: "Order #ORD-2024-002 shipped",
      time: "2 hours ago",
      icon: <Truck className="w-4 h-4" />,
      color: "orange",
    },
    {
      id: 5,
      type: "review",
      message: "New 5-star review received",
      time: "3 hours ago",
      icon: <Star className="w-4 h-4" />,
      color: "yellow",
    },
  ]);

  // Calculate growth percentages
  const calculateGrowth = () => {
    return {
      sales: 12.5,
      orders: 8.2,
      customers: 15.3,
      products: 5.7,
    };
  };

  const growth = calculateGrowth();

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { color: "green", icon: CheckCircle, label: "Completed" },
      processing: { color: "blue", icon: RefreshCw, label: "Processing" },
      pending: { color: "yellow", icon: Clock, label: "Pending" },
      shipped: { color: "purple", icon: Truck, label: "Shipped" },
      cancelled: { color: "red", icon: XCircle, label: "Cancelled" },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-500/10 text-${config.color}-400 border border-${config.color}-500/20`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, growth, color, subtitle }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-xl hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 border border-${color}-500/20`}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {growth > 0 ? (
          <TrendingUp className="w-4 h-4 text-green-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        <span
          className={`text-sm font-medium ${growth > 0 ? "text-green-400" : "text-red-400"}`}
        >
          {Math.abs(growth)}%
        </span>
        <span className="text-gray-500 text-sm">vs last period</span>
      </div>
    </div>
  );

  // Mini Chart Component (Simple Bar Chart)
  const MiniChart = ({ data, color }) => (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, index) => (
        <div
          key={index}
          className={`w-2 bg-gradient-to-t from-${color}-500 to-${color}-400 rounded-t transition-all duration-300 hover:opacity-80`}
          style={{ height: `${(value / Math.max(...data)) * 100}%` }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            Dashboard Overview
          </h2>
          <p className="text-gray-400">
            Track your business performance and metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            {["today", "week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* Calendar Button */}
          <button className="p-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition">
            <Calendar size={20} />
          </button>

          {/* Refresh Button */}
          <button className="p-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          icon={DollarSign}
          growth={growth.sales}
          color="green"
          subtitle="+15% from last month"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingBag}
          growth={growth.orders}
          color="blue"
          subtitle="Last 30 days"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          growth={growth.customers}
          color="purple"
          subtitle="Active users"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          growth={growth.products}
          color="orange"
          subtitle="In stock"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Sales Analytics</h3>
              <p className="text-gray-400 text-sm mt-1">
                Daily sales performance
              </p>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition">
              <MoreVertical size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Simple Chart Visualization */}
          <div className="space-y-6">
            <div className="flex items-end gap-2 h-48">
              {salesData.daily.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="relative w-full group">
                    <div
                      className="w-full bg-gradient-to-t from-red-500 to-pink-500 rounded-t-lg transition-all duration-300 hover:opacity-80"
                      style={{
                        height: `${(value / Math.max(...salesData.daily)) * 150}px`,
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        ${value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs">Day {index + 1}</span>
                </div>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                  <span className="text-gray-400 text-sm">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-400 text-sm">Orders</span>
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                Total: $
                {salesData.daily.reduce((a, b) => a + b, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Recent Activities
              </h3>
              <p className="text-gray-400 text-sm mt-1">Latest updates</p>
            </div>
            <Activity size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition cursor-pointer group"
              >
                <div
                  className={`p-2 rounded-lg bg-${activity.color}-500/20 border border-${activity.color}-500/20 group-hover:scale-110 transition`}
                >
                  <div className={`text-${activity.color}-400`}>
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{activity.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-600 group-hover:text-gray-400 transition"
                />
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-red-400 hover:text-red-300 transition font-medium">
            View All Activities
          </button>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">
              Best Selling Products
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Top performing products this month
            </p>
          </div>
          <button className="text-red-400 hover:text-red-300 text-sm font-medium transition flex items-center gap-1">
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Sales
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Revenue
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Growth
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Rating
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {bestSellingProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-white font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">
                      {product.sales.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">
                      ${product.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {product.growth > 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={
                          product.growth > 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {Math.abs(product.growth)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white">{product.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition group">
                      <Eye
                        size={16}
                        className="text-gray-400 group-hover:text-white"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            <p className="text-gray-400 text-sm mt-1">Latest customer orders</p>
          </div>
          <button className="text-red-400 hover:text-red-300 text-sm font-medium transition flex items-center gap-1">
            View All Orders <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition"
                >
                  <td className="py-4 px-4">
                    <span className="text-red-400 font-medium">{order.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{order.customer}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-300">{order.product}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-medium">
                      ${order.amount}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-400 text-sm">{order.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition group">
                      <Eye
                        size={16}
                        className="text-gray-400 group-hover:text-white"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm font-medium mb-2">
            Conversion Rate
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">
              {stats.conversionRate}%
            </span>
            <span className="text-green-400 text-sm mb-1">+0.8%</span>
          </div>
          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.conversionRate * 15}%` }}
            />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm font-medium mb-2">
            Avg. Order Value
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">$367</span>
            <span className="text-green-400 text-sm mb-1">+$24</span>
          </div>
          <MiniChart data={[320, 340, 355, 360, 367]} color="blue" />
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm font-medium mb-2">
            Customer Satisfaction
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">4.8</span>
            <div className="flex items-center mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400/30 text-yellow-400/30"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Based on 1,247 reviews</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <h4 className="text-gray-400 text-sm font-medium mb-2">
            Pending Orders
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">23</span>
            <span className="text-yellow-400 text-sm mb-1">
              Requires attention
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-sm">12 orders overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
