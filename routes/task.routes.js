import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import isAuth from "../middlewares/isAuth.js";
import LogModel from "../models/log.models.js";
import TaskModel from "../models/task.models.js";
import UserModel from "../models/user.models.js";

const taskRoute = express.Router();

taskRoute.post("/create-task", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = req.currentUser;

    const newTask = await TaskModel.create({ ...req.body, user: user._id });

    const userUpdated = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $push: {
          tasks: newTask._id,
        },
      },
      { new: true, runValidators: true }
    );

    await LogModel.create({
      user: user._id,
      task: newTask._id,
      status: "Uma nova Tarefa foi criada",
    });

    return res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

//all-tasks
taskRoute.get("/my-tasks", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = req.currentUser;

    const allTasks = await TaskModel.find({ user: user._id }).populate("user");

    return res.status(200).json(allTasks);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

taskRoute.put(
  "/concluida/:idTask",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idTask } = req.params;

      const task = await TaskModel.findByIdAndUpdate(
        idTask,
        {
          complete: true,
          dateFin: Date.now(),
        },
        { new: true }
      );

      await LogModel.create({
        task: idTask,
        user: req.currentUser._id,
        status: `A Tarefa "${task.details}" foi concluida.`,
      });

      return res.status(200).json();
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.errors);
    }
  }
);

taskRoute.delete(
  "/delete/:idTask",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { idTask } = req.params;

      //deletei a tarefa
      const deletedTask = await TaskModel.findByIdAndDelete(idTask);

      //retirei o id da tarega de dentro da minha array TASKS
      await UserModel.findByIdAndUpdate(
        deletedTask.user,
        {
          $pull: {
            tasks: idTask,
          },
        },
        { new: true, runValidators: true }
      );

      await LogModel.create({
        task: idTask,
        user: req.currentUser._id,
        status: `A tarefa "${deletedTask.details}" foi excluída com o status ${deletedTask.status}!`,
      });

      return res.status(200).json(deletedTask);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.errors);
    }
  }
);

//update-task
taskRoute.put("/edit/:idTask", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { idTask } = req.params;

    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: idTask },
      { ...req.body },
      { new: true, runValidators: true }
    );

    await LogModel.create({
      user: req.currentUser._id,
      task: idTask,
      status: `A tarefa "${updatedTask.details}" teve seu status atualizado`,
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

taskRoute.get(
  "/all-tasks",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const allTasks = await TaskModel.find();

      return res.status(200).json(allTasks);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error.errors);
    }
  }
);

taskRoute.get("/oneTask/:idTask", async (req, res) => {
  try {
    const { idTask } = req.params;

    const oneTask = await TaskModel.findById(idTask).populate("user");

    return res.status(200).json(oneTask);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.errors);
  }
});

export default taskRoute;
