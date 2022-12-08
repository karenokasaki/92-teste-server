import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import LogModel from "../models/log.models.js";


const logRoute = express.Router();

logRoute.get("/my-logs", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const logs = await LogModel.find({ user: req.currentUser._id }).populate(
      "task"
    );

    return res.status(200).json(logs);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

export default logRoute;
