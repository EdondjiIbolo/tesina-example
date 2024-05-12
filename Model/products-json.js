import "dotenv/config";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { readFile } from "../service/readFile.js";
const { users } = readFile("../src/mocks/users.json");

export class UserModel {
  static async loginUser({ object }) {
    const { email, password } = object;

    try {
      const findUser = users.find((user) => {
        return user.email === email && user.password === password;
      });
      if (findUser <= 0) {
        throw new Error("Wrong Email or password ");
      }
      const user = findUser;

      const userForToken = {
        id: user.id,
        password: user.password,
      };
      const token = jwt.sign(userForToken, "1234", { expiresIn: "3d" });
      const data = {
        name: user.name,
        username: user.surename,
        email: user.email,
        token,
      };
      return data;
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
  static async AccountInfo({ object }) {
    const { email } = object;
    try {
      const getUserInfo = users.find((user) => user.email === email);
      if (getUserInfo <= 0) {
        throw new Error("User Not gound");
      }
      console.log(getUserInfo);

      return getUserInfo;
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}
