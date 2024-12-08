import React, { useState } from "react";
import bloodImage from "../../assets/Blood-1.png";
import { axiosInstance } from "../../configs/axios.instance";

export default function BloodRequestForm() {
  const [selectedBloodTypes, setSelectedBloodTypes] = useState([]);
  const [selectedUrgency, setSelectedUrgency] = useState(null);
  const [hospitalName, setHospitalName] = useState("");
  const [message, setMessage] = useState("");

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const urgencyLevels = ["Not Urgent", "Moderate", "Urgent", "Very Urgent"];

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("/requests/add-request", {
        hospital: hospitalName,
        bloodTypes: selectedBloodTypes,
        urgency: selectedUrgency,
      });
      setMessage("successs");
    } catch (error) {
      setSelectedBloodTypes([]);
      setSelectedUrgency(null);
      setHospitalName("");
      setMessage("Request failed. Please try again.");
      setTimeout(() => setMessage(""), 3000);
      console.error("Error adding request:", error);
    }
  };

  const handleBloodTypeSelection = (type) => {
    setSelectedBloodTypes((prevSelected) =>
      prevSelected.includes(type)
        ? prevSelected.filter((t) => t !== type)
        : [...prevSelected, type]
    );
  };

  return (
    <div className="flex flex-row gap-4 p-8 max-w-6xl mx-auto">
      {/* Left Side: Form */}
      <div className="w-2/3">
        <h1 className="text-2xl font-bold mb-6">Fill a Blood Request</h1>
        {message !== "" && (
          <div
            className={`p-4 rounded-md text-lg font-semibold ${
              message === "successs"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message === "successs"
              ? "Request is created"
              : "Request is not created"}
          </div>
        )}

        {/* Hospital Name Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Hospital Name:
          </label>
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Write name..."
          />
        </div>

        {/* Blood Type Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Blood Type:
          </label>
          <div className="grid grid-cols-4 gap-3">
            {bloodTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleBloodTypeSelection(type)}
                className={`p-3 text-lg font-medium rounded-md border ${
                  selectedBloodTypes.includes(type)
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-red-500 border-red-500"
                } hover:bg-red-100`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency Level Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Urgency Level:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {urgencyLevels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedUrgency(level)}
                className={`p-3 text-lg font-medium rounded-md border ${
                  selectedUrgency === level
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-red-500 border-red-500"
                } hover:bg-red-100`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmit}
            className="bg-red-500 text-white p-3 rounded-md text-lg font-medium w-full hover:bg-red-600"
          >
            Create Request
          </button>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="w-1/3 flex items-center justify-center">
        <img
          src={bloodImage}
          alt="Blood donation"
          className="object-cover rounded-lg w-full h-[28rem]"
        />
      </div>
    </div>
  );
}
