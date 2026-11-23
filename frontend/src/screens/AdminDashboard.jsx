import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [parkings, setParkings] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [totalSlots, setTotalSlots] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Fetch all parking
    const fetchParking = async () => {
        try {
            const res = await fetch("https://parksafe-backend-19x3.onrender.com/parking");
            const data = await res.json();

            setParkings(data);
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong");
        }
    };

    // Delete parking
    const deleteParking = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this parking?"
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`https://parksafe-backend-19x3.onrender.com/admin/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

           const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                fetchParking();
            } else {
                toast.error(data.message);
            }

        } catch (err) {
            console.log(err);
            toast.error("Delete failed");
        }
    };

    const addParking = async () => {
        if (!name || !price || !totalSlots) {
            toast.error("Please fill all fields.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch("https://parksafe-backend-19x3.onrender.com/admin", {
                method: "POST",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                    totalSlots,
                }),
            });

            const data = await res.json();




            if (res.ok) {
                toast.success(data.message);

                fetchParking();

                setName("");
                setPrice("");
                setTotalSlots("");

                setShowForm(false);
                setIsEditing(false);
                setEditingId(null);
            } else {
                toast.error(data.message);
            }

        } catch (err) {
            console.log(err);
            toast.error("Failed to add parking");
        }
    };

    const editParking = (parking) => {
        setIsEditing(true);
        setEditingId(parking._id);

        setName(parking.name);
        setPrice(parking.price);
        setTotalSlots(parking.totalSlots);

        setShowForm(true);
    };

    const updateParking = async () => {
        if (!name || !price || !totalSlots) {
            toast.error("Please fill all fields.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `https://parksafe-backend-19x3.onrender.com/admin/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        price,
                        totalSlots,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);

                setShowForm(false);
                setIsEditing(false);
                setEditingId(null);

                setName("");
                setPrice("");
                setTotalSlots("");

                fetchParking();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.log(err);
            toast.error("Update failed");
        }
    };

    useEffect(() => {
        fetchParking();
    }, []);

    return (
        <div className="admin-container">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">
                Manage parking locations, pricing and slots
            </p>

            <div className="dashboard-cards">
                <div className="dashboard-card blue">
                    <h3>Total Parking</h3>
                    <h1>{parkings.length}</h1>
                </div>

                <div className="dashboard-card green">
                    <h3>Total Slots</h3>
                    <h1>
                        {parkings.reduce((sum, p) => sum + p.totalSlots, 0)}
                    </h1>
                </div>

                <div className="dashboard-card yellow">
                    <h3>Available Slots</h3>
                    <h1>
                        {parkings.reduce((sum, p) => sum + p.availableSlots, 0)}
                    </h1>
                </div>

                <div className="dashboard-card red">
                    <h3>Booked Slots</h3>
                    <h1>
                        {parkings.reduce(
                            (sum, p) => sum + (p.totalSlots - p.availableSlots),
                            0
                        )}
                    </h1>
                </div>
            </div>

            <div className="button-row">

            <button className="add-btn"
                onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setName("");
                    setPrice("");
                    setTotalSlots("");
                    setShowForm(true);
                }}
            >
                + Add Parking
            </button>
            </div>

            {showForm && (
                <div className="parking-form">
                    <h3>
                        {isEditing ? "✏️ Edit Parking" : "➕ Add Parking"}
                    </h3>

                    <input
                        type="text"
                        placeholder="Parking Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                    />

                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="form-input"
                    />

                    <input
                        type="number"
                        placeholder="Total Slots"
                        value={totalSlots}
                        onChange={(e) => setTotalSlots(e.target.value)}
                        className="form-input"
                    />

                    <button className="save-btn"
                        onClick={() => {
                            if (isEditing) {
                                updateParking();
                            } else {
                                addParking();
                            }
                        }}
                    >
                        {isEditing ? "Update Parking" : "Add Parking"}
                    </button>

                    <button className="cancel-btn"
                        onClick={() => {
                            setShowForm(false);
                            setIsEditing(false);
                            setEditingId(null);

                            setName("");
                            setPrice("");
                            setTotalSlots("");
                        }}

                    >
                        Cancel
                    </button>


                </div>
            )}



            <table className="parking-table">
                <thead>
                    <tr>
                        <th>Parking Name</th>
                        <th>Price</th>
                        <th>Total Slots</th>
                        <th>Available Slots</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {parkings.map((parking) => (
                        <tr key={parking._id}>
                            <td>{parking.name}</td>
                            <td>₹{parking.price}</td>
                            <td>{parking.totalSlots}</td>
                            <td>{parking.availableSlots}</td>

                            <td>
                                <button
                                    className="edit-btn"
                                    onClick={() => editParking(parking)}
                                >
                                    Edit
                                </button>
                            </td>

                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteParking(parking._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;