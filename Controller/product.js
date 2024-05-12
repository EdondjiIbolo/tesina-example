import jwt from "jsonwebtoken";
import { readFile } from "../service/readFile.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import bcrypt from "bcrypt";
const produts = readFile("../src/mocks/products.json");
const Allusers = readFile("../src/mocks/users.json");
import stripe from "stripe";
const channel = stripe(process.env.STRIPE_SECRET);
const endpointSecret =
  "whsec_e1c83351be80ce1957ab009ffbaaf0ed9f85e95a839d96dc5a018850c41a9861";

import { UserModel } from "../Model/products-json.js";

export class ServiceController {
  static async AccountInfo(req, res) {
    const object = req.query;

    const result = await UserModel.AccountInfo({ object });
    if (result?.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  }

  static async getProducts(req, res) {
    const { id } = req.query;

    if (id) {
      const product = produts.all_products?.find((produtc) => produtc.id == id);

      return res.status(200).json(product);
    }
    res.status(200).json(produts);
  }
  static async getImage(req, res) {
    const { id } = req.params;
    const imagePath = `../src/images/${id}`; // Relative path to the image
    console.log("object");
    // Get the directory name of the current module file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Construct the absolute path to the image file
    const absolutePath = path.join(__dirname, imagePath);
    //   const absolutePath = `${__dirname}/${imagePath}`;

    // Send the image file as a response
    return res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error("Error sending image:", err);
        return res.status(404).send("Image not found");
      }
      console.log("Image sent successfully:", imagePath);
    });
  }
  static async getAllProducts(req, res) {
    const { page } = req.query;
    console.log(page);
    const numElement = page * 5;
    const numBeguin = page * 5 - 5;
    console.log(numBeguin, numElement);
    const products = produts.all_products;
    const totalProducts = products.length;
    const newProducts = products.slice(numBeguin, numElement);
    console.log(newProducts);
    return res.status(200).json({ newProducts, totalProducts });
  }
  static async getAllUsers(req, res) {
    const { page } = req.query;
    console.log(page);
    const numElement = page * 8;
    const numBeguin = page * 8 - 8;
    console.log(numBeguin, numElement);
    const { users } = Allusers;
    const totalUsers = users.length;
    const newUsers = users.slice(numBeguin, numElement);
    console.log(newUsers);
    return res.status(200).json({ newUsers, totalUsers });
  }
  static async ProcessOrder(req, res) {
    const { products } = req.body;
    const listItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.id,
          images: [product.imageUrl],
          metadata: { product_id: product.id },
        },
        unit_amount: Math.round(product.new_price * 100),
      },
      quantity: product.cantidad,
    }));

    const session = await channel.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: listItems,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    //   // const result = await ServiceModel.createOrder({ id });
    //   // if (result.error) {
    //   //   return res.status(400).json({ error: result.error });
    //   // }

    return res.status(201).json({ id: session.id });
  }
  // static async createOrder(req, res) {
  //   express.raw({ type: "application/json" }),
  //     (request, response) => {
  //       const sig = request.headers["stripe-signature"];

  //       let event;

  //       try {
  //         event = channel.webhooks.constructEvent(
  //           request.body,
  //           sig,
  //           endpointSecret
  //         );
  //       } catch (err) {
  //         response.status(400).send(`Webhook Error: ${err.message}`);
  //         return;
  //       }

  //       // Handle the event
  //       switch (event.type) {
  //         case "payment_intent.succeeded":
  //           const paymentIntentSucceeded = event.data.object;
  //           try {
  //             const paymentIntentSucceeded = event.data.object;
  //             // Aquí puedes acceder a la información del pago exitoso (paymentIntentSucceeded)

  //             // Lógica para crear una orden en tu base de datos usando tu modelo de servicio
  //             const result = ServiceModel.createOrder({
  //               paymentIntent: paymentIntentSucceeded,
  //             });
  //             console.log("Orden creada en la base de datos:", result);

  //             // Enviar una respuesta al cliente indicando que el evento fue manejado correctamente
  //             res
  //               .status(200)
  //               .send("Evento payment_intent.succeeded manejado correctamente");
  //           } catch (error) {
  //             console.error(
  //               "Error al manejar el evento payment_intent.succeeded:",
  //               error
  //             );
  //             res.status(500).send("Error interno del servidor");
  //           }
  //           // Then define and call a function to handle the event payment_intent.succeeded
  //           break;
  //         // ... handle other event types
  //         default:
  //           console.log(`Unhandled event type ${event.type}`);
  //       }

  //       // Return a 200 response to acknowledge receipt of the event
  //       response.send();
  //     };
  // }
}
