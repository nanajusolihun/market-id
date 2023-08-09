import express from "express";

import { allCheckout, confirmCheckout, createCheckout, deleteCheckout, detailCheckout, historyCheckout } from "../controllers/c_checkouts.js";

import { authentication, admin, customer } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/checkout/new", authentication, customer, createCheckout);
ROUTER.get("/checkout/all", authentication, admin, allCheckout);
ROUTER.get("/checkout/:_id/history", authentication, customer, historyCheckout);
ROUTER.get("/checkout/:invoice/detail", authentication, detailCheckout);
ROUTER.put("/checkout/:invoice/confirm", authentication, customer, confirmCheckout);
ROUTER.delete("/checkout/:invoice/delete", authentication, admin, deleteCheckout);

export default ROUTER;
