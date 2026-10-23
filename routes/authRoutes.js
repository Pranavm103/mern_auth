const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/authcontroller.js");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware.js");

router.post("/register", register);
router.post("/login", login);

// Protected: any authenticated user
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Protected: admin only
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  (req, res) => {
    res.json({ message: "Welcome, administrator" });
  }
);

module.exports = router;
