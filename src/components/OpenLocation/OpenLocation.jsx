import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { axiosInstance } from "../../configs/axios.instance";

function OpenLocation() {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null); // Reference to the single marker
  const [filter, setFilter] = useState("Add"); // Default action is "Add"
  const [newBranchLocation, setNewBranchLocation] = useState(""); // Tracks selected location on the map
  const [branchName, setBranchName] = useState(""); // Name input value
  const [branchNumber, setBranchNumber] = useState(""); // Number input value
  const [branches, setBranches] = useState([]); // List of all branches
  const [editingBranch, setEditingBranch] = useState(null); // Branch being edited
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [message, setMessage] = useState(""); // State for displaying messages
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 33.8547, lng: 35.8778 },
        zoom: 8,
      });
      googleMapRef.current = map;

      // Initialize Places Autocomplete
      const input = document.getElementById("autocomplete");
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);

      // Handle place selection from autocomplete
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.error("No geometry found for the place.");
          return;
        }

        // Center map and add a marker
        const location = place.geometry.location.toJSON();
        map.setCenter(location);
        map.setZoom(15);
        addSingleMarker(location, "New Branch");
        reverseGeocode(location);
      });

      // Add a click event listener to the map
      map.addListener("click", (event) => {
        const clickedLocation = event.latLng.toJSON();
        addSingleMarker(clickedLocation, "Clicked Location");
        reverseGeocode(clickedLocation);
      });
    };

    document.body.appendChild(script);

    return () => {
      if (googleMapRef.current) googleMapRef.current = null;
      document.body.removeChild(script);
    };
  }, []);

  // Add or update a single marker on the map
  const addSingleMarker = (location, title) => {
    const map = googleMapRef.current;
    if (!map) return;

    if (markerRef.current) markerRef.current.setMap(null);

    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      title: title,
    });
    markerRef.current = marker;
  };

  // Reverse geocode to get an address from a location
  const reverseGeocode = (location) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address.replace(
          /^[A-Z0-9\+\-]+,\s*/,
          ""
        );
        setNewBranchLocation(address);
      } else {
        console.error("Reverse geocoding failed: " + status);
        setNewBranchLocation(`Lat: ${location.lat}, Lng: ${location.lng}`);
      }
      setLat(location.lat);
      setLng(location.lng);
    });
  };

  // Handle adding a new branch
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchName || !branchNumber || !newBranchLocation) {
      setMessage("Please fill all fields!");
      setMessageType("error");
      return;
    }

    const requestData = {
      name: branchName,
      branch_number: branchNumber,
      location: newBranchLocation,
      latitude: lat.toString(),
      longtitude: lng.toString(),
    };

    try {
      const response = await axiosInstance.post(
        "/branches/add-branch",
        requestData
      );
      setMessage("Branch added successfully!");
      setMessageType("success");
      setBranchName("");
      setBranchNumber("");
      setNewBranchLocation("");
      setLat(null);
      setLng(null);
    } catch (error) {
      setMessage("Failed to add the branch!");
      setMessageType("error");
    }
  };

  // Handle editing a branch
  const handleEdit = async (branchId) => {
    try {
      const response = await axiosInstance.get(`/branches/branch/${branchId}`);
      const branchToEdit = response.data;

      if (branchToEdit) {
        setEditingBranch(branchToEdit);
        setBranchName(branchToEdit.name);
        setBranchNumber(branchToEdit.branch_number);
        setNewBranchLocation(branchToEdit.location);

        setFilter("Edit");

        // Update the map with the branch's location
        const map = googleMapRef.current;
        if (map && branchToEdit.lat && branchToEdit.lng) {
          const location = {
            lat: parseFloat(branchToEdit.lat),
            lng: parseFloat(branchToEdit.lng),
          };
          addSingleMarker(location, branchToEdit.name);
          map.setCenter(location);
          map.setZoom(15);
        }
      } else {
        setMessage("Branch not found!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to fetch branch!");
      setMessageType("error");
    }
  };

  // Handle submitting the edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!branchName || !branchNumber || !newBranchLocation) {
      setMessage("Please fill all fields!");
      setMessageType("error");
      return;
    }

    const updatedBranch = {
      id: editingBranch.branch_id,
      name: branchName,
      branch_number: branchNumber,
      location: newBranchLocation,
      latitude: lat,
      longtitude: lng,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/branches/edit-branch/${
          editingBranch.branch_id
        }`,
        updatedBranch
      );
      setMessage("Branch Updated successfully!");
      setMessageType("success");

      // Clear form and refresh the branch list
      setBranchName("");
      setBranchNumber("");
      setNewBranchLocation("");
      setLat(null);
      setLng(null);

      // Reset editing state and refresh the branch list
      setEditingBranch(null);
      setFilter("View All Branches");
      fetchAllBranches();
    } catch (error) {
      console.error("Error updating branch:", error);
      setMessage("Failed to update branch!");
    }
  };

  // Fetch all branches
  const fetchAllBranches = async () => {
    try {
      const response = await axiosInstance.get("/branches/branches");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // Fetch branches when filter is set to "View All Branches"
  useEffect(() => {
    if (filter === "View All Branches") fetchAllBranches();
  }, [filter]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="text-2xl font-bold mb-4">Open Location</h1>
      <div className="flex">
        <div className="w-3/5 pr-4">
          {message && (
            <div
              className={`p-2 rounded mb-4 ${
                messageType === "success"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {message}
            </div>
          )}
          <div className="flex justify-between mb-4 bg-gray-100 rounded p-2">
            {["Add", "View All Branches"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded ${
                  filter === status ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {["Add", "Edit"].includes(filter) && (
            <form
              onSubmit={filter === "Add" ? handleSubmit : handleEditSubmit}
              className="mb-4"
            >
              <input
                type="text"
                placeholder="Name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <input
                type="text"
                placeholder="Number"
                value={branchNumber}
                onChange={(e) => setBranchNumber(e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <input
                type="text"
                placeholder="Location"
                value={newBranchLocation}
                readOnly
                className="border p-2 rounded w-full mb-2 bg-gray-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {filter === "Add" ? "Add" : "Update"}
              </button>
            </form>
          )}

          {filter === "View All Branches" && (
            <div className="bg-gray-100 p-4 rounded">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="p-2 mb-2 bg-white rounded shadow"
                >
                  <p>
                    <strong>Name:</strong> {branch.name}
                  </p>
                  <p>
                    <strong>Number:</strong> {branch.branch_number}
                  </p>
                  <p>
                    <strong>Location:</strong> {branch.location}
                  </p>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded mt-2"
                    onClick={() => handleEdit(branch.branch_id)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-2/5 relative" style={{ height: "600px" }}>
          <input
            id="autocomplete"
            type="text"
            placeholder="Search for a location"
            className="absolute z-10 top-2 left-2 w-4/5 p-2 border rounded-lg bg-white"
          />
          <div ref={mapRef} style={{ height: "100%" }}></div>
        </div>
      </div>
    </div>
  );
}

export default OpenLocation;
