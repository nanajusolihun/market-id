import ModelProducts from "../models/m_products.js";
import ModelCategories from "../models/m_categories.js";

import Cloudinary from "../config/cloudinary.js";

import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

// ! CREATE PRODUCT
const ctreateProduct = async (req, res) => {
  const body = req.body;
  const file = req.file;

  const rules = {
    name: "required|min:4|max:100",
    price: "required|numeric",
    category_id: "required|alpha_num",
  };

  try {
    if (!file) return Messages(res, 412, "Image Required");

    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 413, { ...err, status });

      const findCategories = await ModelCategories.findOne({ _id: body.category_id });
      if (!findCategories) return Messages(res, 404, "Data ID categories not found");

      // Upload new image to cloudinary
      const result = await Cloudinary.uploader.upload(file.path);

      //   asigned data
      const payload = {
        ...body,
        name: body.name.trim(),
        price: parseInt(body.price),
        image: {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        },
        category: {
          _id: findCategories._id,
          name: findCategories.name,
        },
      };

      // create product
      await new ModelProducts(payload).save();

      Messages(res, 200, "Create Product Success");
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! READ ALL DATA PRODUCTS
const allProduct = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "asc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filterName = {
      name: { $regex: q, $options: "i" },
    };

    const total = await ModelProducts.count(filterName);
    const data = await ModelProducts.find(filterName).sort({ _id: sort_key }).skip(pages).limit(per_page);

    Messages(res, 200, "Suceess all data", data, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! DETAIL PRODUCT
const detailProduct = async (req, res) => {
  const _id = req.params._id;

  try {
    const findProduct = await ModelProducts.findById({ _id });
    if (!findProduct) return Messages(res, 404, "Data ID Product not found");

    Messages(res, 200, "Detail data product success", findProduct);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! UPDATE PRODUCT
const updateProduct = async (req, res) => {
  const _id = req.params._id;
  const body = req.body;
  const file = req.file;

  const rules = {
    name: "required|min:4|max:100",
    price: "required|numeric",
    category_id: "required|alpha_num",
  };

  try {
    const findProduct = await ModelProducts.findById({ _id });
    if (!findProduct) return Messages(res, 404, "Data ID Product not found");

    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 413, { ...err, status });

      let payload = {};

      const findCategories = await ModelCategories.findOne({ _id: body.category_id });
      if (!findCategories) return Messages(res, 404, "Data ID Category not found");

      if (file) {
        const product_image = findProduct._doc.image.url;
        const product_cloudinary_id = findProduct._doc.image.cloudinary_id;

        // delete image from cloudinary
        if (product_image) await Cloudinary.uploader.destroy(product_cloudinary_id);

        // upload new image to cloudinary
        const result = await Cloudinary.uploader.upload(file.path);

        // assigned data secure_url & public_id to key image
        payload.image = {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        };
      }

      payload = {
        ...payload,
        ...body,
        name: body.name.trim(),
        category: {
          _id: findCategories._id,
          name: findCategories.name,
        },
      };

      const newData = await ModelProducts.findByIdAndUpdate(_id, { ...payload }, { new: true });

      Messages(res, 200, "Update product succes", newData);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! DELETE PRODUCT
const deleteProduct = async (req, res) => {
  const _id = req.params._id;

  try {
    const findProduct = await ModelProducts.findById({ _id });
    if (!findProduct) return Messages(res, 404, "Data ID Product not found");

    const cloudinary_id = findProduct._doc.image.cloudinary_id;

    cloudinary_id && (await Cloudinary.uploader.destroy(cloudinary_id));

    // delete data product in collection
    await ModelProducts.deleteOne({ _id });

    Messages(res, 200, "Delete data Product success");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

export { ctreateProduct, allProduct, detailProduct, updateProduct, deleteProduct };
