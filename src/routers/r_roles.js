import express from "express";
import { createRoles, allRole, detailRole, updateRole, deletRole } from "../controllers/c_roles.js";

import { authentication, admin } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/role/new", authentication, admin, createRoles);
ROUTER.get("/role/all", authentication, admin, allRole);
ROUTER.get("/role/:_id/detail", authentication, admin, detailRole);
ROUTER.put("/role/:_id/update", authentication, admin, updateRole);
ROUTER.delete("/role/:_id/delete", authentication, admin, deletRole);

export default ROUTER;
