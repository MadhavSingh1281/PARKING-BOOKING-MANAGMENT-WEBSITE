const express = require("express");
const router = express.Router();

const Parking = require("../models/Parking");
const Booking = require("../models/Booking");
const { auth, adminAuth } = require("../middleware/auth");

// ADD SAMPLE PARKING
router.get("/add-parking", async (req, res) => {
  await Parking.deleteMany();

  await Parking.insertMany([
    { name: "Metro A", totalSlots: 50, availableSlots: 50, price: 20 },
    { name: "Metro UP", totalSlots: 80, availableSlots: 80, price: 25 },
    { name: "Rajiv Chowk", totalSlots: 100, availableSlots: 100, price: 40 },
    { name: "Huda City Centre", totalSlots: 120, availableSlots: 120, price: 30 },
    { name: "Noida Sector 18", totalSlots: 90, availableSlots: 90, price: 15 },
    { name: "Dwarka Sector 21", totalSlots: 60, availableSlots: 60, price: 18 },
    { name: "Kashmere Gate", totalSlots: 150, availableSlots: 150, price: 35 },
    { name: "Test Parking 1", totalSlots: 5, availableSlots: 5, price: 10 },
    { name: "Test Parking 2", totalSlots: 5, availableSlots: 5, price: 12 },
    { name: "Test Parking 3", totalSlots: 7, availableSlots: 7, price: 15 }
  ]);

  res.send("Parking data added");
});

// GET PARKING
router.get("/parking", async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    const parkings = await Parking.find();
    const result = [];

    for (let p of parkings) {
      let overlapCount = 0;

      if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);

        overlapCount = await Booking.countDocuments({
          location: p.name,
          startTime: { $lt: end },
          endTime: { $gt: start }
        });

      } else {
        const now = new Date();

        overlapCount = await Booking.countDocuments({
          location: p.name,
          startTime: { $lt: now },
          endTime: { $gt: now }
        });
      }

      result.push({
        _id: p._id,
        name: p.name,
        price: p.price,
        totalSlots: p.totalSlots,
        availableSlots: Math.max(0, p.totalSlots - overlapCount)
      });
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// ADMIN - ADD PARKING
// =========================
router.post("/admin", auth, adminAuth, async (req, res) => {
  try {
    const { name, totalSlots, price } = req.body;

    if (!name || !totalSlots || !price) {
      return res.status(400).json({
        message: "Please provide all fields."
      });
    }

    const existingParking = await Parking.findOne({ name });

    if (existingParking) {
      return res.status(400).json({
        message: "Parking already exists."
      });
    }

    const parking = new Parking({
      name,
      totalSlots,
      availableSlots: Number(totalSlots),
      price
    });

    await parking.save();

    res.status(201).json({
      message: "Parking added successfully.",
      parking
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
});

// ADMIN - EDIT PARKING

router.put("/admin/:id", auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalSlots, price } = req.body;

    if (!name || !totalSlots || !price) {
      return res.status(400).json({
        message: "Please provide all fields."
      });
    }

    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({
        message: "Parking not found."
      });
    }

    parking.name = name;
    parking.totalSlots = totalSlots;
    parking.price = price;

    await parking.save();

    res.status(200).json({
      message: "Parking updated successfully.",
      parking
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });
  }
});



// ADMIN - DELETE PARKING

router.delete("/admin/:id", auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({
        message: "Parking not found."
      });
    }

    // Check whether bookings exist for this parking
    const bookingExists = await Booking.findOne({
      location: parking.name
    });

    if (bookingExists) {
      return res.status(400).json({
        message:
          "Cannot delete parking because bookings already exist."
      });
    }

    await Parking.findByIdAndDelete(id);

    res.status(200).json({
      message: "Parking deleted successfully."
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

module.exports = router;