const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  log: {
    type: [logSchema],
  },
});

const User = mongoose.model("User", userSchema);

async function createUser(username) {
  try {
    const user = new User({ username: username });
    return await user.save();
  } catch (error) {
    console.log("Something's wrong...", error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    return await User.find().select({ count: 0, log: 0 });
  } catch (error) {
    console.log("Something's wrong...", error);
    throw error;
  }
}

async function createExerciseLog(id, data) {
  const newLog = {
    description: data.description,
    duration: data.duration,
    date: data.date ? new Date(data.date) : new Date(),
  };

  try {
    const user = await User.findOneAndUpdate({ _id: id }, { $push: { log: newLog }, $inc: { count: 1 } }, { new: true });

    const addedLog = user.log[user.log.length - 1];
    const response = {
      _id: user._id.toString(),
      username: user.username,
      date: addedLog.date.toDateString(),
      duration: addedLog.duration,
      description: addedLog.description,
    };

    return response;
  } catch (error) {
    console.log("Something's wrong...", error);
    throw error;
  }
}

async function getUserLogs(id) {
  try {
    const userDoc = await User.findOne({ _id: id }).select({ __v: 0, "log._id": 0 });
    const user = userDoc.toObject();

    user.log.forEach((log) => {
      log.date = log.date.toDateString();
    });

    return user;
  } catch (error) {
    console.log("Something's wrong...", error);
    throw error;
  }
}

module.exports = {
  createUser,
  getAllUsers,
  createExerciseLog,
  getUserLogs,
};
