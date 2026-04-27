const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));
// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
// 🔥 Replace with MongoDB Atlas URL when deploying
const MONGO_URL = "mongodb://127.0.0.1:27017/spidyzz";

mongoose.connect(MONGO_URL)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ DB Error:", err));


// ================= USER MODEL =================
const User = mongoose.model("User", {
    fullname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    followers: { type: [String], default: [] },
    following: { type: [String], default: [] }
});


/// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
    console.log("🔥 Register API HIT");
    console.log("DATA:", req.body);

    try {
        const { fullname, username, password } = req.body;

        if (!fullname || !username || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullname,
            username,
            password: hashedPassword
        });

        await newUser.save();

        console.log("✅ User saved!");

        res.json({ message: "Registered successfully" });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // check fields
        if (!username || !password) {
            return res.status(400).json({ message: "Enter username & password" });
        }

        // find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // success
        res.json({
            message: "✅ Login success",
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                profilePic: user.profilePic
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// memory DB
app.post("/api/messages", (req, res) => {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
        return res.status(400).json({ error: "Missing data" });
    }

    const newMsg = { sender, receiver, text };

    messages.push(newMsg);

    console.log("📩 New Message:", newMsg);

    res.json({ success: true });
});

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
    res.send("Server is working");
});

/* ---------------- SEND MESSAGE ---------------- */
app.post("/api/messages", (req, res) => {
    const { sender, receiver, text } = req.body;

    messages.push({ sender, receiver, text });

    res.json({ success: true, messages });
});

/* ---------------- GET MESSAGES ---------------- */
app.get("/api/messages/:me/:user", (req, res) => {
    const { me, user } = req.params;

    const chat = messages.filter(m =>
        (m.sender === me && m.receiver === user) ||
        (m.sender === user && m.receiver === me)
    );

    res.json(chat);
});

/* ---------------- START SERVER ---------------- */
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
