import express from "express";

import { allProduct, ctreateProduct, deleteProduct, detailProduct, updateProduct } from "../controllers/c_products.js";

import { authentication, admin, customer } from "../middleware/auth.js";
import uploadImg from "../middleware/upload_img.js";

const ROUTER = express.Router();

ROUTER.post("/products/new", authentication, admin, uploadImg, ctreateProduct);
ROUTER.get("/products", allProduct);
ROUTER.get("/products/:_id/detail", authentication, admin, detailProduct);
ROUTER.put("/products/:_id/update", authentication, admin, uploadImg, updateProduct);
ROUTER.delete("/products/:_id/delete", authentication, admin, deleteProduct);

export default ROUTER;
