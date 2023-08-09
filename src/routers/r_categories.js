import express from "express";
import { allCategories, createCategories, deleteCategories, detailCategories, updateCategories } from "../controllers/c_categories.js";

import { authentication, admin } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/categories/new", authentication, admin, createCategories);
ROUTER.get("/categories", authentication, admin, allCategories);
ROUTER.get("/categories/:_id/detail", authentication, admin, detailCategories);
ROUTER.put("/categories/:_id/update", authentication, admin, updateCategories);
ROUTER.delete("/categories/:_id/delete", authentication, admin, deleteCategories);

export default ROUTER;
