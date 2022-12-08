//install express-jwt
import { expressjwt } from "express-jwt";
import * as dotenv from "dotenv";

dotenv.config();

//cria uma chave chamada auth na requisição com as informações que estão dentro do token

export default expressjwt({
  secret: process.env.TOKEN_SIGN_SECRET,
  algorithms: ["HS256"],
});
