import React from "react";
import { CircleDashed, X } from "lucide-react";
import axios from "axios";
import { useEffect } from "react";

const Order = () => {
  const [isdetails, setIsDetails] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [orderStatus, setOrderStatus] = React.useState("");  
  const [paymentStatus, setPaymentStatus] = React.useState("");
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/admin/get-order"
        );
        if (response.status === 200) {
          setOrders(response.data.reverse());
          console.log("Orders fetched successfully:", response.data);
        } else {
          console.error("Failed to fetch orders:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const handleModifyOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await axios.put(
        `http://localhost:4000/api/admin/modify-order/${selectedOrder._id}`,
        {
          deliveryStatus: orderStatus,
          paymentStatus: paymentStatus,
        }
      );
      if (response.status === 200) {
        console.log("Order modified successfully:", response.data);
        setIsDetails(false);
        setSelectedOrder(null);
        // Optionally, refresh the orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder._id ? response.data : order
          )
        );
      } else {
        console.error("Failed to modify order:", response.statusText);
      }
    } catch (error) {
      console.error("Error modifying order:", error);
    }
  }
  // State for filtering
  const [filter, setFilter] = React.useState("all");

  // Filtered orders based on filter state
  const filteredOrders = React.useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "paid") return orders.filter((o) => o.paymentStatus === "paid");
    if (filter === "unpaid") return orders.filter((o) => o.paymentStatus !== "paid");
    if (filter === "delivered") return orders.filter((o) => o.deliveryStatus === "delivered");
    if (filter === "undelivered") return orders.filter((o) => o.deliveryStatus !== "delivered");
    return orders;
  }, [orders, filter]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-10 px-2 md:px-8">
      <div className="relative bg-white shadow-xl rounded-2xl w-full overflow-x-auto border border-gray-200">
        
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 bg-white">
          <button
            className={`px-4 py-2 rounded-lg shadow-lg font-medium  ${filter === "all" ? "bg-blue-500 text-white hover:bg-blue-600" : " bg-blue-400/30 hover:bg-blue-500/40 text-blue-700"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-lg shadow-lg font-medium ${filter === "paid" ? "text-white bg-blue-500 hover:bg-blue-600" : "text-blue-700 bg-blue-100 hover:bg-blue-200"}`}
            onClick={() => setFilter("paid")}
          >
            Paid
          </button>
          <button
            className={`px-4 py-2 rounded-lg shadow-lg font-medium ${filter === "unpaid" ? "text-white bg-yellow-500 hover:bg-yellow-600" : "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"}`}
            onClick={() => setFilter("unpaid")}
          >
            Unpaid
          </button>
          <button
            className={`px-4 py-2 rounded-lg shadow-lg font-medium ${filter === "delivered" ? "text-white bg-green-500 hover:bg-green-600" : "text-green-700 bg-green-100 hover:bg-green-200"}`}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
          <button
            className={`px-4 py-2 shadow-lg rounded-lg font-medium ${filter === "undelivered" ? "text-white bg-red-500 hover:bg-red-600" : "text-red-700 bg-red-100 hover:bg-red-200"}`}
            onClick={() => setFilter("undelivered")}
          >
            Undelivered
          </button>
        </div>
        <table className="w-full text-center border-collapse">
          <thead className="capitalize bg-[#D4F5F5] shadow-lg">
            <tr>
              <th className="px-6 py-4 text-gray-700 font-semibold">Date</th>
              <th className="px-6 py-4 text-gray-700 font-semibold">
                Customer
              </th>
              <th className="px-6 py-4 text-gray-700 font-semibold">Items</th>
              <th className="px-6 py-4 text-gray-700 font-semibold">Payment</th>
              <th className="px-6 py-4 text-gray-700 font-semibold">Total</th>
              <th className="px-6 py-4 text-gray-700 font-semibold">
                Delivery Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-blue-50 cursor-pointer transition"
                onClick={() => {
                  setIsDetails(true);
                  setSelectedOrder(order);
                  setOrderStatus(order.deliveryStatus);
                  setPaymentStatus(order.paymentStatus);
                }}
              >
                <td className="px-6 py-4 border-b border-gray-100">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </td>
                <td className="px-6 py-4 border-b border-gray-100 font-medium">
                  {order.name}
                </td>
                <td className="px-6 py-4 border-b border-gray-100">
                  {order.products.length}
                </td>
                {order.paymentStatus === "paid" ? (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 border border-green-400 text-green-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-green-600" />
                      <span>Paid</span>
                    </div>
                  </td>
                ) : order.paymentStatus === "pending" ? (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-yellow-500" />
                      <span>Pending</span>
                    </div>
                  </td>
                ) : (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-red-100 border border-red-400 text-red-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-red-600" />
                      <span>Failed</span>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 border-b border-gray-100 font-semibold text-blue-700">
                  {order.amount
                    ? `₹${order.amount.toLocaleString("en-IN", {})}`
                    : "₹0"}
                </td>
                {order.deliveryStatus === "delivered" ? (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 border border-green-400 text-green-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-green-600" />
                      <span>Delivered</span>
                    </div>
                  </td>
                ) : order.deliveryStatus === "cancelled" ? (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-red-100 border border-red-400 text-red-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-red-600" />
                      <span>Cancelled</span>
                    </div>
                  </td>
                ) : order.deliveryStatus === "processing" ? (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-yellow-500" />
                      <span>Processing</span>
                    </div>
                  </td>
                ) : order.deliveryStatus === "shipped" ? (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 border border-blue-400 text-blue-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-blue-600" />
                      <span>Shipped</span>
                    </div>
                  </td>
                ) : (
                  <td className="py-4 border-b border-gray-100">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 border border-gray-400 text-gray-800 gap-2 font-medium">
                      <CircleDashed className="w-4 text-gray-500" />
                      <span>Unknown</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {isdetails && selectedOrder && (
          <div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ zIndex: 50 }}
          >
            <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-0 shadow-2xl flex items-center justify-center w-full h-full">
              <div className="w-ful relative bg-white/60 max-w-3xl rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Close"
                  type="button"
                  onClick={() => {
                    setIsDetails(false);
                    setSelectedOrder(null);
                  }}
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold mb-8 text-[#D81159] tracking-tight">
                  Order Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-500">
                        Customer Name:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {selectedOrder.name}
                      </span>
                    </div>
                    <div className="flex flex-col capitalize gap-2 mb-4">
                      <span className="font-semibold text-gray-500">
                        Delivery Address:
                      </span>
                      <div className="ml-2 text-gray-900 font-medium">
                        <div>{selectedOrder.completeAddress || "N/A"}</div>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <div>
                            <span className="text-gray-500 ">Type: </span>
                            <span>{selectedOrder.addressType || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Landmark: </span>
                            <span>{selectedOrder.landmark || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">City: </span>
                            <span>{selectedOrder.city || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">State: </span>
                            <span>{selectedOrder.state || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pincode: </span>
                            <span>{selectedOrder.pincode || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-500">
                        Order Date:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {selectedOrder.createdAt
                          ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block mb-3">
                      Products:
                    </span>
                    <ul className="list-disc list-inside capitalize ml-4 overflow-auto max-h-50 text-gray-900 space-y-1">
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((prod, idx) => (
                          <li key={prod._id || idx}>
                            {prod.productId.name || "Product"}{" "}
                            <span className="text-gray-500">
                              - Qty: {prod.quantity || 1}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>No products</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">
                      Order Status:
                    </span>
                    <select
                      className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-medium text-gray-700"
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">
                      Payment Status:
                    </span>
                    <select
                      className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-medium text-gray-700"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-[#D81159] cursor-pointer text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-green-500 transition-all duration-150"
                    onClick={handleModifyOrder}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;

{
  /* <tr className="hover:bg-blue-50 transition">
  <td className="px-6 py-4 border-b border-gray-100">10/06/2002</td>
  <td className="px-6 py-4 border-b border-gray-100 font-medium">Rahbar Samir</td>
  <td className="px-6 py-4 border-b border-gray-100">01</td>
 
  <td className="px-6 py-4 border-b border-gray-100 font-semibold text-blue-700">₹1200</td>
  <td className="py-4 border-b border-gray-100">
    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-red-100 border border-red-400 text-red-800 gap-2 font-medium">
      <CircleDashed className="w-4" />
      <span>Cancel</span>
    </div>
  </td>
</tr> */
}
