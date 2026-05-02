import React from "react";
import { useEffect } from "react";
import axios from "axios";

const Feedback = () => {
  const [feedback, setFeedback] = React.useState([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/admin/Feedback"
        );
        if (response.data.status === 200) {
          setFeedback(response.data.feedback);
          setProducts(response.data.products);
          console.log(response.data.products);
        } else {
          console.error("Error fetching feedback:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

 

  const [selectedProduct, setSelectedProduct] = React.useState("");

  const [newFeedback, setNewFeedback] = React.useState({
    productId: "",
    customerName: "",
    rating: "",
    reviewTitle: "",
    reviewDescription: "",
  });

  const handleAddFeedback = async (e) => {
    e.preventDefault();

      axios
        .post("http://localhost:4000/api/admin/feedback", {
          productId: newFeedback.productId,
          user_name: newFeedback.customerName,
          rating: Number(newFeedback.rating),
          reviewTitle: newFeedback.reviewTitle,
          reviewDescription: newFeedback.reviewDescription,
        })
        .then((response) => {
          if (response.data.status === 200) {
            setFeedback((prev) => [ response.data.feedback,...prev]);
            setNewFeedback({
              productId: "",
              customerName: "",
              rating: "",
              reviewTitle: "",
              reviewDescription: "",
            });
            
            // setFeedback((fb) => [
            //   ...fb,
            //   {
            //     productId: newFeedback.productId,
            //     customerName: newFeedback.customerName,
            //     rating: Number(newFeedback.rating),
            //     reviewTitle: newFeedback.reviewTitle,
            //     reviewDescription: newFeedback.reviewDescription,
            //   },
            // ]);
          } else {
            console.error("Error adding feedbackaa:", response.status);
          }
        })
        .catch((error) => {
          console.error("Error adding feedback:", error);
        }
       
      );
}
  const handleDeleteFeedback = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/admin/feedback/${id}`
      );
      if (response.data.status === 200) {
        setFeedback((feedback) => feedback.filter((fb) => fb._id !== id));
      } else {
        console.error("Error deleting feedback:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const [editingIdx, setEditingIdx] = React.useState(null);
  const [editFeedback, setEditFeedback] = React.useState({
    productId: "",
    customerName: "",
    rating: "",
    reviewTitle: "",
    reviewDescription: "",
  });

  const handleEditSave = (idx) => {
    axios
      .put(`http://localhost:4000/api/admin/feedback/${feedback[idx]._id}`, {
        productId: editFeedback.productId,
        user_name: editFeedback.customerName,
        rating: Number(editFeedback.rating),
        reviewTitle: editFeedback.reviewTitle,
        reviewDescription: editFeedback.reviewDescription,
      })
      .then((response) => {
        if (response.data.status === 200) {
          console.log("Feedback updated successfully");
        } else {
          console.error("Error updating feedback:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error updating feedback:", error);
      });

    setFeedback((fb) =>
      fb.map((item, i) =>
        i === idx
          ? {
              ...item,
              productId: editFeedback.productId,
              user_name: editFeedback.customerName,
              rating: Number(editFeedback.rating),
              reviewTitle: editFeedback.reviewTitle,
              reviewDescription: editFeedback.reviewDescription,
            }
          : item
      )
    );
    setEditingIdx(null);
  };

  const handleEditCancel = () => {
    setEditingIdx(null);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 py-10 px-2 md:px-8">
      <div className="relative bg-white shadow-2xl rounded-3xl w-full mx-auto overflow-x-auto border border-blue-200">
        <div className="p-8">
          <h2 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
            <img src="/f2.gif" className="w-12" alt="" />
            Feedback Dashboard
          </h2>

          <div className="w-full flex justify-center items-center">
            <form
              className="bg-gradient-to-r w-full max-w-4xl from-blue-50 to-blue-100 rounded-xl p-6 mb-10 flex flex-col gap-4 shadow"
              onSubmit={handleAddFeedback}
            >
              <h3 className="font-semibold text-xl text-blue-700 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Feedback
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  className="border border-blue-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={newFeedback.productId}
                  onChange={(e) =>
                    setNewFeedback((f) => ({ ...f, productId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="border border-blue-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  type="text"
                  placeholder="Customer Name"
                  value={newFeedback.customerName}
                  onChange={(e) =>
                    setNewFeedback((f) => ({
                      ...f,
                      customerName: e.target.value,
                    }))
                  }
                  required
                />
                <select
                  className="border border-blue-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={newFeedback.rating}
                  onChange={(e) =>
                    setNewFeedback((f) => ({ ...f, rating: e.target.value }))
                  }
                  required
                >
                  <option value="">Rating</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                type="text"
                placeholder="Review Title"
                value={newFeedback.reviewTitle}
                onChange={(e) =>
                  setNewFeedback((f) => ({ ...f, reviewTitle: e.target.value }))
                }
                required
              />
              <textarea
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Review Description"
                value={newFeedback.reviewDescription}
                onChange={(e) =>
                  setNewFeedback((f) => ({
                    ...f,
                    reviewDescription: e.target.value,
                  }))
                }
                required
                rows={3}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 shadow transition w-fit"
              >
                Submit Feedback
              </button>
            </form>
          </div>
          <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
            <label
              className="font-medium text-blue-700"
              htmlFor="productSelect"
            >
              Select Product:
            </label>
            <select
              id="productSelect"
              className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-4 text-blue-700 flex items-center gap-2">
              <img src="/feedback.gif" className="w-7" alt="" />
              Feedback List
            </h3>
            <div className="overflow-x-auto rounded-lg shadow">
              <div className="flex flex-col gap-6">
                {feedback.filter(
                  (fb) =>
                    !selectedProduct ||
                    (fb.productId?._id || fb.productId) === selectedProduct
                ).length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No feedback found.
                  </div>
                ) : (
                  feedback
                    .filter(
                      (fb) =>
                        !selectedProduct ||
                        (fb.productId?._id || fb.productId) === selectedProduct
                    )
                    .map((fb, idx) => {
                      // const originalIdx = feedback.findIndex(
                      //   f =>
                      //     f.productId.name === fb.productId.name &&
                      //     f.user_name === fb.user_name &&
                      //     f.reviewTitle === fb.reviewTitle &&
                      //     f.reviewDescription === fb.reviewDescription &&
                      //     f.rating === fb.rating
                      // );
                      // const isEditing = editingIdx === originalIdx;
                      const isEditingRow = editingIdx === idx;
                      return (
                        <div
                          key={fb._id}
                          className="flex flex-col md:flex-row justify-between items-stretch bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg p-6 gap-6 hover:shadow-2xl transition"
                        >
                          {/* Left: Customer Info */}
                          <div className="flex flex-col justify-center md:w-1/3 items-center md:items-start border-r border-blue-100 pr-0 md:pr-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-200 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold text-blue-700 shadow">
                                {fb.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700 text-lg">
                                  {fb.user_name}
                                </div>
                                <div className=" text-gray-500">
                                  {fb.productId?.name || "product name"}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 italic">
                              {fb.userEmail}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col gap-2 justify-between">
                            {isEditingRow ? (
                              <>
                                <div className="flex flex-col md:flex-row gap-2">
                                  <select
                                    className="border border-blue-300 bg-white rounded px-2 py-1 flex-1"
                                    value={editFeedback.productId}
                                    onChange={(e) =>
                                      setEditFeedback((f) => ({
                                        ...f,
                                        productId: e.target.value,
                                      }))
                                    }
                                  >
                                    {products.map((product) => (
                                      <option
                                        key={product.id}
                                        value={product.id}
                                      >
                                        {product.name}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    className="border border-blue-300 bg-white rounded px-2 py-1 flex-1"
                                    type="text"
                                    value={editFeedback.customerName}
                                    onChange={(e) =>
                                      setEditFeedback((f) => ({
                                        ...f,
                                        customerName: e.target.value,
                                      }))
                                    }
                                    placeholder="Customer Name"
                                  />
                                  <select
                                    className="border border-blue-300 bg-white rounded px-2 py-1 flex-1"
                                    value={editFeedback.rating}
                                    onChange={(e) =>
                                      setEditFeedback((f) => ({
                                        ...f,
                                        rating: e.target.value,
                                      }))
                                    }
                                  >
                                    {[1, 2, 3, 4, 5].map((r) => (
                                      <option key={r} value={r}>
                                        {r} Star{r > 1 ? "s" : ""}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <input
                                  className="border border-blue-300 bg-white rounded px-2 py-1 mt-2"
                                  type="text"
                                  value={editFeedback.reviewTitle}
                                  onChange={(e) =>
                                    setEditFeedback((f) => ({
                                      ...f,
                                      reviewTitle: e.target.value,
                                    }))
                                  }
                                  placeholder="Review Title"
                                />
                                <textarea
                                  className="border border-blue-300 bg-white rounded px-2 py-1 mt-2"
                                  value={editFeedback.reviewDescription}
                                  onChange={(e) =>
                                    setEditFeedback((f) => ({
                                      ...f,
                                      reviewDescription: e.target.value,
                                    }))
                                  }
                                  placeholder="Review Description"
                                  rows={2}
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    onClick={() => handleEditSave(idx)}
                                    type="button"
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                                    onClick={handleEditCancel}
                                    type="button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                  <div className="font-semibold text-lg text-blue-800">
                                    {fb.reviewTitle}
                                  </div>
                                  <div className="flex items-center gap-1 text-yellow-500 ml-0 md:ml-4">
                                    {Array.from({ length: fb.rating }).map(
                                      (_, i) => (
                                        <svg
                                          key={i}
                                          className="w-5 h-5 inline"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                                        </svg>
                                      )
                                    )}
                                    <span className="text-gray-500 text-xs ml-1">
                                      {fb.rating}/5
                                    </span>
                                  </div>
                                </div>
                                <div className="text-gray-700 text-base bg-white/60 rounded-lg p-3 border border-blue-100 shadow-inner">
                                  {fb.reviewDescription}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-4 py-1 rounded-lg font-medium hover:from-blue-600 hover:to-blue-500 shadow transition"
                                    onClick={() => {
                                      setEditingIdx(idx);
                                      setIsEditing(true);
                                      setEditFeedback({
                                        productId:
                                          fb.productId?._id ||
                                          fb.productId ||
                                          "",
                                        customerName:
                                          fb.user_name || fb.customerName || "",
                                        rating: fb.rating,
                                        reviewTitle: fb.reviewTitle,
                                        reviewDescription: fb.reviewDescription,
                                      });
                                    }}
                                    type="button"
                                  >
                                    Modify
                                  </button>
                                  <button
                                    className="bg-gradient-to-r from-red-500 to-red-400 text-white px-4 py-1 rounded-lg font-medium hover:from-red-600 hover:to-red-500 shadow transition"
                                    onClick={() => handleDeleteFeedback(fb._id)}
                                    type="button"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
