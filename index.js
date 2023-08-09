import express from "express";
import cors from "cors";
import { PORT } from "./src/config/secret.js";

// Import Users
import r_Users from "./src/routers/r_users.js";
import r_Roles from "./src/routers/r_roles.js";
import r_Categories from "./src/routers/r_categories.js";
import r_Products from "./src/routers/r_products.js";
import r_Checkouts from "./src/routers/r_checkouts.js";
import r_Address from "./src/routers/r_address.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Routers
app.use("/api/v1", r_Users);
app.use("/api/v1", r_Roles);
app.use("/api/v1", r_Categories);
app.use("/api/v1", r_Products);
app.use("/api/v1", r_Checkouts);
app.use("/api/v1", r_Address);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
