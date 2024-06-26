import { Router } from "express";
import { ServiceController } from "../Controller/product.js";

export const serviceRouter = Router();

serviceRouter.get("/account-info", ServiceController.AccountInfo);
serviceRouter.get("/products", ServiceController.getProducts);
serviceRouter.get("/images/:id", ServiceController.getImage);
serviceRouter.post("/process-order", ServiceController.ProcessOrder);
serviceRouter.get("/all-products", ServiceController.getAllProducts);
serviceRouter.get("/all-users", ServiceController.getAllUsers);
// serviceRouter.post("/webhook", ServiceController.createOrder);
