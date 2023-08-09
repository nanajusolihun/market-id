import mongoose from "../config/connection.js";

const { model, Schema } = mongoose;

const schemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
};

const categoriesSchema = new Schema(
  {
    name: String,
  },
  schemaOptions
);

export default model("Categories", categoriesSchema);
