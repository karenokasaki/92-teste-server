import express from "express";
import UserModel from "../models/user.models.js";
import bcrypt from "bcrypt";
import generateToken from "../config/jwt.config.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import nodemailer from "nodemailer";
import LogModel from "../models/log.models.js";

const userRoute = express.Router();

const saltRounds = 10;

let transporter = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    secure: false,
    user: "turma92wd@hotmail.com",
    pass: "SenhaSegura@123",
  },
});

userRoute.post("/sign-up", async (req, res) => {
  try {
    //capturando a password
    const { password, email } = req.body;

    //checando se a password existe e se passou na regex
    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#!])[0-9a-zA-Z$*&@#!]{8,}$/
      )
    ) {
      return res
        .status(400)
        .json({ msg: "Senha não tem os requisitos necessários" });
    }

    //gerar o salt
    const salt = await bcrypt.genSalt(saltRounds);

    //hasheando a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    //adicionando a senha hasheada no banco de dados
    const user = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    //apagando a senha para devolver ao cliente
    delete user._doc.passwordHash;

    const mailOptions = {
      from: "turma92wd@hotmail.com", // nossa email
      to: email, //email do usuário que se cadastrou
      subject: "Ativação de conta", //assunto
      html: `<p>Clique no link para ativar sua conta:<p> 
        <a href=http://localhost:8080/user/activate-account/${user._id}>LINK</a>`,
    };

    //await transporter.sendMail(mailOptions);

    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

userRoute.post("/login", async (req, res) => {
  try {
    //capturando o email e a password
    const { email, password } = req.body;

    //achar o usuário no banco de dados pelo email
    const user = await UserModel.findOne({ email: email });

    if (!user || !user.confirmEmail) {
      return res
        .status(400)
        .json({ msg: "Usuário não cadastrado ou não confirmado" });
    }

    //chamar o método .compare() da biblioteca bcrypt para comparar se a password e o password são compatíveis
    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;

      //criar um token para o usuário logado
      const token = generateToken(user);

      //retorna o usuário + token de autenticação
      return res.status(200).json({
        user: user,
        token: token,
      });
    } else {
      return res.status(401).json({
        msg: "Email ou Senha inválidos",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(err);
  }
});

userRoute.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    return res.status(200).json(loggedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(err);
  }
});

userRoute.get(
  "/admin-profile",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      return res.status(200).json({ msg: "User is admin" });
    } catch (error) {
      console.log(error);
      return res.status(400).json(err);
    }
  }
);

userRoute.get("/activate-account/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await UserModel.findByIdAndUpdate(
      id,
      { confirmEmail: true },
      { new: true, runValidators: true }
    );

    return res.send("Sua conta foi validada com sucesso!");
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

userRoute.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = req.currentUser;

    const editUser = await UserModel.findByIdAndUpdate(
      user._id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    await LogModel.create({
      user: user._id,
      status: "Usuário editou seu perfil",
    });

    return res.status(200).json(editUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

userRoute.delete("/delete", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = req.currentUser;

    await UserModel.findByIdAndDelete(user._id);

    return res.status(200).json({ msg: "Usuário editado" });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

export default userRoute;
