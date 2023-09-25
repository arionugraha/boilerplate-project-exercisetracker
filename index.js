require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./repository/repository");
const connectDB = require("./repository/db-connection");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
connectDB();

app.post("/api/users", async (req, res) => {
  try {
    const user = await db.createUser(req.body.username);
    res.json({ username: user.username, _id: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw error;
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await db.getAllUsers();
    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw error;
  }
});

app.post("/api/users/:id/exercises", async (req, res) => {
  try {
    const log = await db.createExerciseLog(req.params.id, req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw error;
  }
});

app.get("/api/users/:id/logs", async (req, res) => {
  try {
    let conditions = { _id: req.params.id };

    if (req.query.from || req.query.to) {
      const dateConditions = {};

      if (req.query.from) {
        dateConditions.$gte = new Date(req.query.from);
      }

      if (req.query.to) {
        dateConditions.$lte = new Date(req.query.to);
      }

      conditions = { ...conditions, "log.date": dateConditions };
    }

    const logLimit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const user = await db.getUserLogs(conditions, logLimit);
    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw error;
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
