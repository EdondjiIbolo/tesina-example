import channel from "stripe";
import "dotenv/config";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import { ServiceModel } from "../Model/product.js";
const app = express();

const PORT = process.env.PORT ?? 4242;

app.use(cors());
app.use(express.raw({ type: "application/json" }));
app.use(bodyParser.json());
app.disable("x-powered-by");
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
const stripe = channel(process.env.STRIPE_SECRET);
const endpointSecret =
  "whsec_e1c83351be80ce1957ab009ffbaaf0ed9f85e95a839d96dc5a018850c41a9861";
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),

  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    let total_amount;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(err);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
      console.log("hola");
      const paymentIntentSucceeded = event.data.object;
      console.log(paymentIntentSucceeded);
      const price = paymentIntentSucceeded.amount_received;
      total_amount = (price / 100).toFixed(2);
      console.log(total_amount);
      //crear un order con los datos : precio , uuid para el order , estado: pagado , buscar forma de agregar el address , hora de creacion del pedido , y agregar el usuario que realiza la compra, y el estado
    }
    if (event.type === "checkout.session.completed") {
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"],
        }
      );
      //   console.log(event.data.object.id);
      return;
      // crear o insertar los datos de cada producto en la tabla product_orders , y con el id del producto relacionar con la tabla productos.
      const lineItems = sessionWithLineItems.line_items;
      console.log(lineItems.data);
      const items = lineItems.data;
      const itemsData = items.map((item) => ({
        id: item.description,
        price: item.amount_total,
        quantity: item.quantity,
        total_amount,
      }));

      const result = await ServiceModel.createOrder({
        itemsData,
      });

      return;
    }
    // switch (event.type) {
    //   case "payment_intent.succeeded":
    //     try {
    //       const paymentIntentSucceeded = event.data.object;
    //       // Aquí puedes acceder a la información del pago exitoso (paymentIntentSucceeded)

    //       // Lógica para crear una orden en tu base de datos usando tu modelo de servicio
    //       const result = await ServiceModel.createOrder({
    //         paymentIntent: paymentIntentSucceeded,
    //       });
    //       console.log("Orden creada en la base de datos:", result);

    //       // Enviar una respuesta al cliente indicando que el evento fue manejado correctamente
    //       res
    //         .status(200)
    //         .send("Evento payment_intent.succeeded manejado correctamente");
    //     } catch (error) {
    //       console.error(
    //         "Error al manejar el evento payment_intent.succeeded:",
    //         error
    //       );
    //       res.status(500).send("Error interno del servidor");
    //     }
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
