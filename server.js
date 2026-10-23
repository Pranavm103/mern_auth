
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
    res.json({ message: "MERN Auth API is running" });
});

app.use("/api/auth", authRoutes);

// Register these after the application routes.
app.use(notFound);
app.use(errorHandler);

async function startServer() {
    if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
        throw new Error("Required environment variables are missing");
    }

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
});