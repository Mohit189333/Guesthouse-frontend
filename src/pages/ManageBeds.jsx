import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/ManageBeds.css";

function ManageBeds() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [newBed, setNewBed] = useState({
    bedType: "",
    isAvailable: true
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchBedsByRoom(selectedRoomId);
    }
  }, [selectedRoomId]);

const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get("http://localhost:5050/api/rooms/available", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showMessage("Error fetching rooms. Please try again.", "error");
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      }
    }
  };

const fetchBedsByRoom = async (roomId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:5050/api/rooms/${roomId}/beds`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBeds(response.data);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 403) {
        showMessage("Access denied. Admin privileges required.", "error");
      } else {
        showMessage("Error fetching beds. Please try again.", "error");
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/login");
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBed((prevBed) => ({
      ...prevBed,
      [name]: value,
    }));
  };

    const handleAddBed = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `http://localhost:5050/api/rooms/${selectedRoomId}/beds`,
        newBed,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      showMessage("Bed added successfully!", "success");
      setNewBed({
        bedType: "",
        isAvailable: true
      });
      setIsFormOpen(false);
      fetchBedsByRoom(selectedRoomId);
    } catch (error) {
      console.error("Error adding bed:", error);
      if (error.response?.status === 403) {
        showMessage("Admin privileges required to add beds", "error");
      } else {
        showMessage("Error adding bed. Please try again.", "error");
      }
    }
  };

  const handleUpdateBed = async (bedId, updatedBed) => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.put(
        `http://localhost:5050/api/rooms/${selectedRoomId}/beds/${bedId}`,
        updatedBed,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      showMessage("Bed updated successfully!", "success");
      fetchBedsByRoom(selectedRoomId);
    } catch (error) {
      showMessage("Error updating bed. Please try again.", "error");
    }
  };

  const handleDeleteBed = async (bedId) => {
    if (window.confirm("Are you sure you want to delete this bed?")) {
      try {
        const token = localStorage.getItem("jwtToken");
        await axios.delete(
          `http://localhost:5050/api/rooms/${selectedRoomId}/beds/${bedId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        showMessage("Bed deleted successfully!", "success");
        fetchBedsByRoom(selectedRoomId);
      } catch (error) {
        showMessage("Error deleting bed. Please try again.", "error");
      }
    }
  };

  const toggleBedAvailability = (bed) => {
    const updatedBed = {
      ...bed,
      isAvailable: !bed.isAvailable
    };
    handleUpdateBed(bed.id, updatedBed);
  };

  return (
    <Layout>
      <div className="manage-beds-page">
        <div className="page-header">
          <h1>Bed Management</h1>
          <p>Add, edit, and manage beds for your rooms</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="content-container">
          <div className="room-selection">
            <label htmlFor="room-select">Select Room:</label>
            <select
              id="room-select"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.roomType})
                </option>
              ))}
            </select>
          </div>

          {selectedRoomId && (
            <div className="beds-section">
              <div className="section-header">
                <h2>Beds in Selected Room</h2>
                <button 
                  className="add-bed-toggle"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  disabled={!selectedRoomId}
                >
                  {isFormOpen ? 'Cancel' : '+ Add New Bed'}
                </button>
              </div>

              {isFormOpen && (
                <div className="add-bed-section">
                  <form className="add-bed-form" onSubmit={handleAddBed}>
                    <div className="form-group">
                      <label>Bed Type</label>
                      <select
                        name="bedType"
                        value={newBed.bedType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Queen">Queen</option>
                        <option value="King">King</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Available</label>
                      <select
                        name="isAvailable"
                        value={newBed.isAvailable}
                        onChange={(e) =>
                          setNewBed((prevBed) => ({
                            ...prevBed,
                            isAvailable: e.target.value === "true",
                          }))
                        }
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-button">
                        Add Bed
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {beds.length === 0 ? (
                <div className="empty-state">
                  <p>No beds found in this room.</p>
                </div>
              ) : (
                <div className="beds-grid">
                  {beds.map((bed) => (
                    <div className="bed-card" key={bed.id}>
                      <div className="card-content">
                        <h3>{bed.bedType} Bed</h3>
                        <div className="bed-meta">
                          <span className={`availability ${bed.isAvailable ? 'available' : 'unavailable'}`}>
                            {bed.isAvailable ? 'Available' : 'Occupied'}
                          </span>
                        </div>
                        <div className="bed-actions">
                          <button
                            className="toggle-button"
                            onClick={() => toggleBedAvailability(bed)}
                          >
                            {bed.isAvailable ? 'Mark as Occupied' : 'Mark as Available'}
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteBed(bed.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ManageBeds;