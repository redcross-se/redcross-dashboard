import React, { useState } from "react";
import { FaCircle, FaArrowRight } from "react-icons/fa";
import ApplicationTable from "./ApplicantsTable";

function Application() {

  const [filter, setFilter] = useState("all");



  return (
    <div className="flex">
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-4">Applications</h1>

        <div className="flex justify-between mb-4 bg-gray-100 rounded p-2">
          {["All", "Pending", "Accepted","Rejected"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded ${
                filter === status ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <ApplicationTable status={filter} />
      
      </div>
    </div>
  );
}

export default Application;
