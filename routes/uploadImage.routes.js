import express from "express";
import uploadImg from "../config/cloudnary.config.js";

const uploadRoute = express.Router();

uploadRoute.post("/upload", uploadImg.single("picture"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "Upload Fail" });
  }

  return res.status(201).json({ url: req.file.path });
});

export default uploadRoute;
