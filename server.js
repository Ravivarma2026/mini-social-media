const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
const MONGO_URL = process.env.MONGO_URL;

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

// ================= MEMORY CHAT =================
let messages = [];

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send(`
        <h1>Mini Social Media 🚀</h1>
        <p>Backend is working!</p>
        <p>Use API endpoints like:</p>
        <ul>
            <li>/api/register</li>
            <li>/api/login</li>
        </ul>
    `);
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
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

        await User.create({
            fullname,
            username,
            password: hashedPassword
        });

        res.json({ message: "Registered successfully ✅" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Enter username & password" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }

        res.json({
            message: "Login success ✅",
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

// ================= SEND MESSAGE =================
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

// ================= GET MESSAGES =================
app.get("/api/messages/:me/:user", (req, res) => {
    const { me, user } = req.params;

    const chat = messages.filter(m =>
        (m.sender === me && m.receiver === user) ||
        (m.sender === user && m.receiver === me)
    );

    res.json(chat);
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
