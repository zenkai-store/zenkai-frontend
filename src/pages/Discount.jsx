import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { AiOutlinePlus, AiOutlineClose, AiFillDelete } from "react-icons/ai";
import { FaCircle, FaEdit, FaSave } from "react-icons/fa";
import axios, { toFormData } from "axios";

// TODO handle edit and delete

const Discount = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isAddcouponclick, setIsAddcouponclick] = useState(false);
  const [message, setMessage] = useState();
  const [isdateinvalid, setisdateinvalid] = useState(false);
  const [couponList, setCouponList] = React.useState([]);
  const [editCouponErrorMessage,seteditCouponErrorMessage]=useState('')
  const [iseditCouponError,setiseditCouponError]=useState(false)
  const editerror=useRef()

  const [newCoupon, setNewCoupon] = useState({
    _id: "",
    name: "",
    code: "",
    price: "",
    activeFrom: "",
    activeTo: "",
    limit: "",
    status: {},
  });
  const dateCheck = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const today = new Date();

    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (fromDate > today) {
      return { status: "scheduled", color: "#FFBF00" };
    }
    if (toDate < today) {
      return { status: "expired", color: "#EE4B2B" };
    }
    return { status: "active", color: "#50C878" };
  };
  const handleNewValueChange = (key, value) => {
    const newValue = key === "code" ? value.toUpperCase() : value;

    if (key === "code") {
      const isDuplicate = couponList.some((coupon) => coupon.code === newValue);
      setMessage(isDuplicate);
    }
    setNewCoupon((prev) => ({ ...prev, [key]: newValue }));
  };

  // edit

  const [editvalue, seteditValue] = useState({});

  const editcoupon = (index) => {
    setIsEdit(true);
    setEditIndex(index);
    seteditValue({
      _id: couponList[index]._id,
      name: couponList[index].name,
      code: couponList[index].code,
      price: couponList[index].price,
      activeFrom: couponList[index].activeFrom,
      activeTo: couponList[index].activeTo,
      limit: couponList[index].limit,
      status: couponList[index].status,
    });
  };
  const editchange = (key, value) => {
    seteditValue({ ...editvalue, [key]: value });
  };

  // const formatDateToDMY = (dateStr) => {
  //   const [yyyy, mm, dd] = dateStr.split("-");
  //   return `${dd}-${mm}-${yyyy}`;
  // };
const errorCheck = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  if (fromDate > toDate) {
    // Show error
    editerror.current.style.left = "0px";
    seteditCouponErrorMessage("From date should be before to date");
    setiseditCouponError(true);
 
    // Hide after 5 seconds
    const interval = setInterval(() =>{
      editerror.current.style.left = "-100%";
      setiseditCouponError(false);
      clearInterval(interval); // 🔁 Add this to avoid infinite interval
    }, 5000);

    return false;
  }

  return true;
};


  const handleeditsave = async(mainindex) => {
    const iserror=errorCheck(editvalue.activeFrom,editvalue.activeTo)
    if(!iserror) {
      console.log("tesing")
      return
    }
    try {
     const data= await axios.put(
        `http://localhost:4000/api/admin/coupon/putcoupon?couponId=${editvalue._id}`,
        {
          name: editvalue.name,
          code: editvalue.code,
          price: editvalue.price,
          activeFrom: editvalue.activeFrom,
          activeTo: editvalue.activeFrom,
          limit: editvalue.limit,
        }
      );
      const status = dateCheck(editvalue.activeFrom, editvalue.activeTo);
      setCouponList(
      couponList.map((coupon, index) =>
        mainindex == index ? { ...editvalue, status } : coupon
      )
    );
    } catch (error) {
      console.error(error)
    }finally{
      setIsEdit(false);
    }
  };

  const handlenewCoupon = async (e) => {
    e.preventDefault();
    const to = new Date(newCoupon.activeTo);
    const from = new Date(newCoupon.activeFrom);
    to.setHours(0, 0, 0, 0);
    from.setHours(0, 0, 0, 0);
    if (from > to) {
      setisdateinvalid(true);
      return;
    }
    const status = dateCheck(newCoupon.activeFrom, newCoupon.activeTo);
    try {
      const data = await axios.post(
        "http://localhost:4000/api/admin/coupon/postCoupon",
        {
          name: newCoupon.name,
          code: newCoupon.code,
          price: newCoupon.price,
          activeFrom: newCoupon.activeFrom,
          activeTo: newCoupon.activeTo,
          limit: newCoupon.limit,
        }
      );
      setCouponList([...couponList, { ...newCoupon, status }]);
      setIsAddcouponclick(false);
      setNewCoupon({
        _id: "",
        name: "",
        code: "",
        price: "",
        activeFrom: "",
        activeTo: "",
        limit: "",
        status: {},
      });
    } catch (error) {
      console.error(error.response.data);
    }
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await axios.get(
          "http://localhost:4000/api/admin/coupon/getcoupon"
        );
        console.log(data.data.data);
        setCouponList(data.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchdata();
  }, []);

  const deletecoupon=async(id)=>{
    try {
      const data=await axios.delete(`http://localhost:4000/api/admin/coupon/deletecoupon/${id}`)
      setCouponList(prev=>prev.filter(fil=>fil._id!==id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="w-full relative  min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 p-10">
        {/* heading */}
        <div ref={editerror} className="absolute top-3 left-[-100%] duration-1000  px-2 py-1 rounded-sm min-w-60 bg-red-300 text-red-800 border-1 uppercase border-red-500 ">
        
          {editCouponErrorMessage}
        </div>
        <div
          onClick={() => setIsAddcouponclick(true)}
          className="flex items-center justify-between p-5 capitalize "
        >
          <div>
            <h1 className="font-bold text-3xl ">coupon management</h1>
          </div>
          <div className=" cursor-pointer flex items-center gap-3 px-5 py-2 bg-red-400 hover:bg-red-500 transition-all duration-500  text-white rounded-lg">
            <AiOutlinePlus />
            <h1>add new coupon</h1>
          </div>
        </div>

        {/* table */}
        <div className="flex gap-4 mt-5 justify-start">
          <button className="px-5 py-2 rounded-lg bg-violet-100 text-violet-800 font-semibold shadow hover:bg-violet-200 transition-all">
            All
          </button>
          <button className="px-5 py-2 rounded-lg bg-green-100 text-green-800 font-semibold shadow hover:bg-green-200 transition-all">
            Active
          </button>
          <button className="px-5 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold shadow hover:bg-yellow-200 transition-all">
            Scheduled
          </button>
          <button className="px-5 py-2 rounded-lg bg-red-200 text-red-700 font-semibold shadow hover:bg-red-300 transition-all">
            Expired
          </button>
        </div>
        <table className="min-w-full text-center  divide-y mt-5 divide-blue-100">
          <thead className="bg-blue-50 shadow-lg">
            <tr>
              <th className="px-8 py-4  text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-8 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                code
              </th>
              <th className="px-8 py-4  text-sm font-semibold text-gray-700 uppercase tracking-wider">
                price
              </th>
              <th className="px-8 py-4  text-sm font-semibold text-gray-700 uppercase tracking-wider">
                active from
              </th>
              <th className="px-8 py-4  text-sm font-semibold text-gray-700 uppercase tracking-wider">
                active to
              </th>
              <th className="px-8 py-4  text-sm font-semibold text-gray-700 uppercase tracking-wider">
                limit number
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-100">
            {couponList.map((coupon, index) =>
              isEdit && editIndex == index ? (
                <tr
                  key={index}
                  className="relative hover:bg-gray-50 transition-all duration-150"
                >
                  <td className="px-8 relative gap-2 py-4 whitespace-nowrap text-gray-900 font-medium">
                    <div className="absolute left-5 top-[53%] translate-y-[-50%]">
                      <FaCircle size={12} color={editvalue.status.color} />
                    </div>
                    <input
                      type="text"
                      name=""
                      value={editvalue.name}
                      onChange={(e) => {
                        editchange("name", e.target.value);
                      }}
                      className="p-1 text-center shadow-sm w-40 rounded-sm border border-gray-300 outline-none"
                      id=""
                    />
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    <div className="bg-green-100 py-1 rounded-lg uppercase font-medium text-green-800 border-1 border-green-500 line ">
                      <input
                        type="text"
                        name=""
                        value={editvalue.code}
                        onChange={(e) => {
                          editchange("code", e.target.value);
                        }}
                        className="p-1 outline-none text-center w-30 rounded-sm"
                        id=""
                      />
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    <input
                      type="number"
                      name=""
                      value={editvalue.price}
                      onChange={(e) => {
                        if (e.target.value >= 0) {
                          editchange("price", e.target.value);
                        }
                      }}
                      className="p-1 text-center shadow-sm w-15 rounded-sm border border-gray-300 outline-none "
                      id=""
                    />
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    <input
                      type="date"
                      name=""
                      value={editvalue.activeFrom}
                      onChange={(e) => {
                        editchange("activeFrom", e.target.value);
                      }}
                      className="appearance-none px-2 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      id=""
                    />
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    <input
                      type="date"
                      name=""
                      value={editvalue.activeTo}
                      onChange={(e) => {
                        editchange("activeTo", e.target.value);
                      }}
                      className="appearance-none px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                      id=""
                    />
                  </td>
                  <td className=" py-4 px-4 relative whitespace-nowrap text-gray-900">
                    <div className="flex gap-5  justify-end  items-center">
                      <input
                        type="number"
                        name=""
                        value={editvalue.limit}
                        onChange={(e) => {
                          if (e.target.value >= 0) {
                            editchange("limit", e.target.value);
                          }
                        }}
                        className="p-1 text-center shadow-sm w-15 rounded-sm border border-gray-300 outline-none"
                        id=""
                      />
                      <div className=" flex gap-5 justify-center items-center">
                        <div
                        onClick={()=>deletecoupon(editvalue._id)}
                        className=" hover:scale-130 duration-200 cursor-pointer">
                          <AiFillDelete />
                        </div>
                        <div
                          onClick={() => handleeditsave(index)}
                          className=" hover:scale-130 duration-200 cursor-pointer"
                        >
                          <FaSave />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={index}
                  className="relative hover:bg-gray-100 transition-all duration-150"
                >
                  <td className="px-8 relative gap-2 py-4 whitespace-nowrap text-gray-900 font-medium">
                    <div className="absolute left-5 top-[53%] translate-y-[-50%]">
                      <FaCircle size={12} color={coupon.status.color} />
                      {/* ToDO */}
                    </div>
                    {coupon.name}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    <div className="bg-green-100 py-1 rounded-lg uppercase font-medium text-green-800 border-1 border-green-500 line ">
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">{`₹${coupon.price}`}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    {new Date(coupon.activeFrom).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-gray-900">
                    {new Date(coupon.activeTo).toLocaleDateString("en-GB")}
                  </td>
                  <td className=" py-4 px-4 relative whitespace-nowrap text-gray-900">
                    <div className="flex gap-5  justify-end  items-center">
                      <span>{coupon.limit}</span>
                      <div className=" flex gap-5 justify-center items-center">
                        <div
                        onClick={()=>deletecoupon(coupon._id)}
                         className=" hover:scale-130 duration-200 cursor-pointer">
                          <AiFillDelete />
                        </div>
                        <div
                          onClick={() => editcoupon(index)}
                          className=" hover:scale-130 duration-200 cursor-pointer"
                        >
                          <FaEdit />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {isAddcouponclick && (
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
                    setIsAddcouponclick(false);
                  }}
                >
                  <AiOutlineClose size={20} />
                </button>
                <h2 className="text-3xl capitalize flex justify-center items-center font-bold mb-8 text-[#D81159] tracking-tight text-center">
                  <span className="inline-block align-middle mr-2">
                    <AiOutlinePlus size={20} className="text-[#D81159]" />
                  </span>
                  New Coupon
                </h2>
                <p className="mb-8 text-center text-gray-600 text-lg">
                  Fill out the details below to create a new discount coupon.
                  All fields are required.
                </p>

                <form
                  onSubmit={handlenewCoupon}
                  // className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
                  className="flex flex-col justify-between gap-10 "
                >
                  <div className=" flex gap-5 w-full">
                    <div className=" flex flex-col gap-5 w-full">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 tracking-wide">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newCoupon.name}
                          onChange={(e) =>
                            handleNewValueChange("name", e.target.value)
                          }
                          required
                          className="w-full p-3 border-2 outline-none border-gray-200 focus:border-[#D81159] rounded-lg shadow-sm transition-all"
                          placeholder="Coupon Name"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 tracking-wide">
                          Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={newCoupon.code}
                          onChange={(e) =>
                            handleNewValueChange("code", e.target.value)
                          }
                          required
                          className={`w-full p-3 border-2 border-gray-200 focus:border-[#D81159] outline-none rounded-lg shadow-sm uppercase transition-all ${
                            message ? "line-through" : ""
                          }`}
                          placeholder="COUPON2024"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 tracking-wide">
                          Price
                        </label>
                        <div className="flex items-center">
                          <span className="inline-block px-3 py-2 bg-gray-100 border border-gray-200 rounded-l-lg text-gray-500 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="price"
                            min="0"
                            required
                            value={newCoupon.price}
                            onChange={(e) =>
                              handleNewValueChange("price", e.target.value)
                            }
                            className="w-full p-3 border-2 outline-none border-gray-200 focus:border-[#D81159] rounded-r-lg shadow-sm transition-all"
                            placeholder="Discount Amount"
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" flex flex-col gap-5 w-full">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 tracking-wide">
                          Active From
                        </label>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          name="activeFrom"
                          value={newCoupon.activeFrom}
                          onChange={(e) =>
                            handleNewValueChange("activeFrom", e.target.value)
                          }
                          required
                          className="w-full p-3 outline-none border-2 border-gray-200 focus:border-[#D81159] rounded-lg shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 tracking-wide">
                          Active To
                        </label>
                        <input
                          type="date"
                          name="activeTo"
                          min={new Date().toISOString().split("T")[0]}
                          required
                          value={newCoupon.activeTo}
                          onChange={(e) =>
                            handleNewValueChange("activeTo", e.target.value)
                          }
                          className="w-full p-3 outline-none border-2 border-gray-200 focus:border-[#D81159] rounded-lg shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 tracking-wide">
                          Limit Number
                        </label>
                        <input
                          type="number"
                          value={newCoupon.limit}
                          onChange={(e) =>
                            handleNewValueChange("limit", e.target.value)
                          }
                          name="limit"
                          min="1"
                          required
                          className="w-full p-3 outline-none border-2 border-gray-200 focus:border-[#D81159] rounded-lg shadow-sm transition-all"
                          placeholder="Usage Limit"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex  justify-between ">
                    <p className="text-red-700">
                      {message ? "Coupon code already exist" : ""}
                      {isdateinvalid
                        ? "ACTIVE FROM should be before ACTIVE TO"
                        : ""}
                    </p>
                    <button
                      type="submit"
                      disabled={message ? true : false}
                      className="bg-[#D81159]  cursor-pointer text-white px-15 py-3 rounded-lg font-semibold shadow-lg hover:bg-[#A60B44] hover:scale-105 transition-all duration-200 tracking-wide text-lg"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Discount;
