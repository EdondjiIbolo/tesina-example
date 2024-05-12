import "dotenv/config";
import fs from "node:fs";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const config = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  port: process.env.DB_PORT,
  database: process.env.MYSQLDATABASE,
  // ssl: {
  //   ca: fs.readFileSync("./Server/ca.pem"),
  // },
};

const connection = await mysql.createConnection(config);

export class ServiceModel {
  static async loginUser({ object }) {
    const { email, password } = object;

    try {
      const [getUser, user_row] = await connection.query(
        "SELECT * FROM users where email = ? and password =? ",
        [email, password]
      );
      const [user] = await getUser;
      if (!user) {
        throw new Error("Wrong Email or password ");
      }
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
  static async AccountSetting({ object }) {
    const { name, surename, address, password } = object;
    try {
      const insertdata = await connection.query(
        "UPDATE  users SET name =? , surename =? ,  password=? ",
        [name, surename, password]
      );
      if (insertdata.affectedRows === 0) {
        throw new Error("Failed to update user data");
      }

      return insertdata;
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
  static async signInUser({ object }) {
    const { name, surename, email, password } = object;
    console.log(object);
    const id = crypto.randomUUID();
    try {
      const [isEmailExist, query_row] = await connection.query(
        "SELECT * FROM users WHERE email=?",
        [email]
      );
      //check if the email already exist
      if (isEmailExist.length >= 1) {
        throw new Error("User already exist");
      }
      const insertdata = await connection.query(
        "INSERT INTO users (user_id,name, surename, email, password , role_id) VALUES (?,?,?,?,?,?)",
        [id, name, surename, email, password, 2]
      );
      if (insertdata.affectedRows === 0) {
        throw new Error("Failed to create a new user");
      }
      const userForToken = {
        id: id,
        password: password,
      };
      const token = jwt.sign(userForToken, "1234", { expiresIn: "3d" });
      const data = {
        name: name,
        username: surename,
        email: email,
        token,
      };
      return data;
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
  static async getOrders({ object }) {
    try {
      const [getOrders, ordersRow] = await connection.query(
        "SELECT * FROM orders"
      );
      const [orders] = await getOrders;
      return orders;
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
  static async createOrder({ object }) {
    console.log(object);
    const { total_amount, address, email } = object;
    const orderId = crypto.randomUUID();
    const insert = object.map(async (item) => {
      const { id, quantity, price } = item;
      const create = await connection.query(
        "INSERT INTO product_orders (product_id,quantity,price,order_status) VALUES (?,?,?)",
        [id, quantity, price]
      );
    });
    const getDate = new Date();
    const newDate = getDate.toISOString();
    try {
      const [getUser, rows] = await connection.query(
        "SELECT * FROM users WHERE email=?",
        [email]
      );
      const [user] = getUser;
      if (!user?.id) {
        throw new Error("User not found");
      }
      const userId = user?.id;
      const insertOrder = connection.query(
        "INSERT INTO orders (user_id,total_amount,address,created_at) VALUES (?,?,?,?)",
        [userId, total_amount, address, newDate]
      );
      if (insertOrder.affectedRows <= 0) {
        throw new Error("Error creating the order");
      }
    } catch (error) {
      return { error };
    }
  }
}
