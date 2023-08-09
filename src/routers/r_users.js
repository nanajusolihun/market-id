import express from "express";
import { registerUser, loginUser, getAllData, logoutUser, detailUser, updateUser, deleteUser } from "../controllers/c_users.js";
import uploadImg from "../middleware/upload_img.js";
import { authentication, admin, customer } from "../middleware/auth.js";

const ROUTER = express.Router();

ROUTER.post("/users/new", registerUser);
ROUTER.post("/users/login", loginUser);
ROUTER.post("/users/:_id/logout", authentication, logoutUser);
ROUTER.get("/users", authentication, admin, getAllData);
ROUTER.get("/users/:_id/detail", authentication, detailUser);
ROUTER.put("/users/:_id/update", authentication, uploadImg, updateUser);
ROUTER.delete("/users/:_id/delete", authentication,admin, deleteUser);

export default ROUTER;
