import mongoose from "mongoose";
import { URL_DB } from "./secret.js";

// Connect to databae
try {
  mongoose.connect(URL_DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("Connected to DB success");
} catch (error) {
  handleError(error);
}

process.on("unhandledRejection", (error) => {
  console.log("unhandleRejection", error.message);
});

export default mongoose;
