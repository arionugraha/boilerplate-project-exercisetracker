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

async function getUserLogs(conditions, limit) {
  try {
    const userDoc = await User.findOne(conditions).select({ __v: 0, "log._id": 0 }).exec();
    const user = userDoc.toObject();

    if (conditions["log.date"]) {
      const fromDate = conditions["log.date"].$gte || new Date(-8640000000000000);
      const toDate = conditions["log.date"].$lte || new Date(8640000000000000);

      user.log = user.log.filter((logEntry) => {
        const logDate = new Date(logEntry.date);
        return logDate >= fromDate && logDate <= toDate;
      });
    }

    if (limit !== undefined) {
      user.log = user.log.slice(0, limit);
    }

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
