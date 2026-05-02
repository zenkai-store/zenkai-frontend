import React from "react";
import "../App.css";
import LineChart from "../components/dashboard/ChartBar";
import DoughnutChart from "../components/dashboard/doughnut";

import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import SalesChart from "./dashboard/BarChart";

const Counter = (target, duration, setCount) => {
  let start = 0;
  const startTime = performance.now();

  const animate = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const value = Math.floor(progress * target);
    setCount(value);
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};
const Dashboard = () => {
  const buttons = [
    { label: "12 months", value: "12months" },
    { label: "6 months", value: "6months" },
    { label: "30 days", value: "30days" },
    { label: "7 days", value: "7days" },
  ];
  const [activeBtn, setActiveBtn] = useState("7days");
  const [salesData, setSalesData] = useState([]);

  const [todaySale, setTodaySale] = useState(0);
  const [totalSale, settotalSale] = useState(0);
  const [totalOrder, setTotalOrder] = useState(0);
  const [totalUser, setTotalUser] = useState(0);

  const [pincodedata, setPincodedata] = useState([])

  const handleSaleRange = (active) => {
    setActiveBtn(active.target.value);
  };
  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/dashboard/getsaleData?range=${activeBtn}`)
      .then((res) => setSalesData(res.data));
  }, [activeBtn]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/dashboard/getDashboardData")
      .then((res) => {
        Counter(res.data.todaySale, 2000, setTodaySale);
        Counter(res.data.totalSale, 2000, settotalSale);
        Counter(res.data.totalOrder, 1000, setTotalOrder);
        Counter(res.data.totalUser, 1000, setTotalUser);
      })
      .catch((error) => console.error(error.message));
  }, []);
  useEffect(()=>{
    const fetchpincodeData=async()=>{
      try {
        const data=await axios.get("http://localhost:4000/api/admin/pincode/getpincode")
        if(data.status===200){
          setPincodedata(data.data.data)
        }
      
      } catch (error) {
        console.error(error)
      }
    }
    fetchpincodeData()
  },[])

  return (
    <div className="w-full min-h-screen px-10 py-15 bg-gray-100 ">
      <div className=" flex gap-5 mb-10">
        <div className="uppercase heading bg-white shadow-2xl  rounded-lg p-3 border-1 border-gray-200 flex-1/4">
          <h1 className="text-gray-500 text-[1.1rem] mb-4">today's sale</h1>
          <div className=" flex justify-between">
            <h1 className="text-3xl">
              {todaySale ? `₹${todaySale.toLocaleString("en-IN", {})}` : `₹0`}
            </h1>
            <h1>+36%</h1>
          </div>
        </div>
        <div className="uppercase heading bg-white shadow-2xl   rounded-lg p-3 border-1 border-gray-200 flex-1/4">
          <h1 className="text-gray-500 text-[1.1rem] mb-4">Total Sales</h1>
          <div className=" flex justify-between">
            <h1 className="text-3xl">
              {totalSale ? `₹${totalSale.toLocaleString("en-IN", {})}` : `₹0`}
            </h1>
            <h1>+36%</h1>
          </div>
        </div>
        <div className="uppercase heading bg-white shadow-2xl   rounded-lg p-3 border-1 border-gray-200 flex-1/4">
          <h1 className="text-gray-500 text-[1.1rem] mb-4">total order</h1>
          <div className=" flex justify-between">
            <h1 className="text-3xl">
              {totalOrder ? totalOrder.toLocaleString("en-IN", {}) : 0}
            </h1>
            <h1>+36%</h1>
          </div>
        </div>
        <div className="uppercase heading bg-white shadow-2xl   rounded-lg p-3 border-1 border-gray-200 flex-1/4">
          <h1 className="text-gray-500 text-[1.1rem] mb-4">total customer</h1>
          <div className=" flex justify-between">
            <h1 className="text-3xl">
              {totalUser ? totalUser.toLocaleString("en-IN", {}) : 0}
            </h1>
            <h1>+36%</h1>
          </div>
        </div>
      </div>
      <div className="flex gap-5 ">
        <div className="flex-[70%] p-2 rounded-lg shadow-2xl">
          <div className="flex  justify-between heading text-gray-700 px-5 py-3">
            <h1 className="uppercase heading text-2xl">Sales Report</h1>
            <div className="flex gap-3">
              {buttons.map((btn) => (
                <button
                  key={btn.value}
                  value={btn.value}
                  onClick={handleSaleRange}
                  className="px-2 py-1 w-20 rounded-lg"
                  style={{
                    border:
                      activeBtn === btn.value ? "1px solid black" : "none",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <LineChart salesData={salesData} />
        </div>
        <div className=" flex flex-col uppercase heading text-2xl text-gray-700 justify-evenly items-center rounded-lg flex-[30%] shadow-2xl ">
          <div className=" flex w-full px-5 justify-between ">
            <h1>traffic source</h1>
            <select className="text-lg outline-none" name="" id="">
              <option  value="">
                last 7 days
              </option>
              <option value="">last 30 days</option>
            </select>
          </div>
          <DoughnutChart />
        </div>
      </div>
      <div className="relative h-[600px] mt-10 flex gap-5 justify-between">
        <div className=" absolute right-0 top-0 flex flex-col w-[30%] uppercase heading text-2xl text-gray-700 justify-evenly items-center rounded-lg mt-10 duration-300 hover:shadow-lg  ">
          <h1>buy source</h1>
          <DoughnutChart />
        </div>
        <div className="absolute hover:shadow-lg duration-300  rounded-2xl scrollbar-hide left-0 top-0 w-[65%] max-h-[600px] overflow-y-auto">
        <SalesChart pincodedata={pincodedata} />
      </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
