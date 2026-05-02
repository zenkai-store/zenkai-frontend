import React, { useEffect } from "react";
import axios from "axios";

const User = () => {
  const [users, setUsers] = React.useState([]);
  const [userDetails, setUserDetails] = React.useState([]);
  const [isUser, setIsUser] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [pendingOrders, setPendingOrders] = React.useState(0);
  const [completedOrders, setCompletedOrders] = React.useState(0);
  const [cancelledOrders, setCancelledOrders] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/admin/getUser"
        );
        response.data.users.reverse()
        setUsers(response.data.users);
        
        setUserDetails(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-10 px-2 md:px-8">
      <div className="relative bg-white shadow-2xl rounded-3xl w-full overflow-x-auto border border-blue-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-200 to-blue-100 rounded-t-3xl">
          <h2 className="text-3xl font-extrabold text-blue-800 tracking-tight">
            User List
          </h2>
          <div className="flex gap-5 flex-wrap">
            <input
              placeholder="Type name"
              className="bg-blue-50 px-3 py-2 rounded-2xl focus:outline-none"
              type="text"
              onChange={(e) => {
                
                const searchTerm = e.target.value.toLowerCase();
                const filteredUsers = userDetails.filter((user) =>
                  user.Name.toLowerCase().includes(searchTerm)
                );
                setUsers(filteredUsers);
              }}
            />
            <button className="px-3 py-2 bg-blue-200 shadow hover:bg-blue-50 text-blue-800 rounded-lg">
              Search
            </button>
          </div>
        </div>

        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-blue-50 shadow-lg">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Email ID
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">
                Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-100">
            {users.map((user) => (
              <tr
                onClick={() => {
                  setSelectedUser(user);
                  setIsUser(true);
                  setPendingOrders(
                    user.OrderIds.filter(
                      (order) => order.OrderId.deliveryStatus === "processing"
                    ).length
                  );
                  setCompletedOrders(
                    user.OrderIds.filter(
                      (order) => order.OrderId.deliveryStatus === "delivered"
                    ).length
                  );
                  setCancelledOrders(
                    user.OrderIds.filter(
                      (order) => order.OrderId.deliveryStatus === "cancelled"
                    ).length
                  );

                  setTotalAmount(
                    user.OrderIds.reduce(
                      (acc, order) => acc + order.OrderId.amount,
                      0
                    )
                  );
                }}
                key={user._id}
                className="cursor-pointer hover:bg-blue-50 transition-all duration-150"
              >
                <td className="px-8 py-4 whitespace-nowrap text-blue-900 font-medium">
                  {user.Name}
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-blue-900">
                  {user.emailId}
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-blue-900">
                  +91 {user.phoneNumber}
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-blue-900">
                  {user.OrderIds[0]?.OrderId?.city || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isUser && selectedUser && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{ zIndex: 50 }}
        >
          <div className="backdrop-blur-md bg-blue-100/60 rounded-3xl p-0 shadow-2xl flex items-center justify-center w-full h-full">
            <div className="bg-white rounded-2xl shadow-xl p-12 w-full max-w-4xl border-2 border-blue-200 transition-all duration-300">
              <h3 className="text-3xl font-extrabold mb-8 text-blue-800 text-center tracking-wide">
                Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Customer Name:
                    </span>
                    <span className="text-blue-900 text-lg">
                      {selectedUser.Name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Customer Address:
                    </span>
                    <span className="text-blue-900 text-lg">
                      {selectedUser.OrderIds[0].OrderId.completeAddress}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Customer Email:
                    </span>
                    <span className="text-blue-900 text-lg">
                      {selectedUser.emailId}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Customer Phone Number:
                    </span>
                    <span className="text-blue-900 text-lg">
                      +91 {selectedUser.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Number of Orders:
                    </span>
                    <span className="text-blue-900 text-lg font-semibold">
                      {selectedUser.OrderIds.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Completed Orders:
                    </span>
                    <span className="text-green-600 font-bold text-lg">
                      {completedOrders}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Pending Orders:
                    </span>
                    <span className="text-yellow-600 font-bold text-lg">
                      {pendingOrders}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Cancelled Orders:
                    </span>
                    <span className="text-red-600 font-bold text-lg">
                      {cancelledOrders}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-blue-700 w-56">
                      Total Amount Buy:
                    </span>
                    <span className="text-blue-900 text-lg font-semibold">
                      {`₹${totalAmount.toLocaleString("en-IN", {})}.00`}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-700">
                      Buy Products:
                    </span>
                    <ul className="list-disc list-inside ml-6 mt-1 text-blue-900 space-y-1">
                      {selectedUser.OrderIds.map((order) =>
                        order.OrderId.products.map((product) => (
                          <li
                            key={product.productId._id}
                            className="bg-blue-50 capitalize rounded px-2 py-1"
                          >
                            {product.productId.name} (qty: {product.quantity})
                          </li>
                        ))
                      )}

                      {/* <li className="bg-blue-50 rounded px-2 py-1">
                        Product A
                      </li>
                      <li className="bg-blue-50 rounded px-2 py-1">
                        Product B
                      </li>
                      <li className="bg-blue-50 rounded px-2 py-1">
                        Product C
                      </li> */}
                    </ul>
                  </div>
                </div>
              </div>
              <button
                className="mt-10 w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition"
                onClick={() => setIsUser(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
