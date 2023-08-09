import ModelCategories from "../models/m_categories.js";

import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

// ! CREATE CATEGORIES
const createCategories = async (req, res) => {
  const name = req.body.name;

  const rules = {
    name: "required|min:4|max:20",
  };

  try {
    await isValidator({ name }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const filterName = { name: { $regex: inputName, $options: "i" } };

      const isSameName = await ModelCategories.findOne(filterName);
      if (isSameName) return Messages(res, 400, `${inputName} has been register on system`);

      await new ModelCategories({
        name: inputName,
      }).save();

      Messages(res, 201, `Create data Categories ${inputName} success`);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! REALL ALL DATA CATEGORIES
const allCategories = async (req, res) => {
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

    const total = await ModelCategories.count(filterName);
    const data = await ModelCategories.find(filterName).sort({ _id: sort_key }).skip(pages).limit(per_page);

    Messages(res, 200, "All data Categories", data, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! DETAIL CATEGORIES
const detailCategories = async (req, res) => {
  const _id = req.params._id;
  try {
    const findCategories = await ModelCategories.findById({ _id });
    if (!findCategories) return Messages(res, 404, "Data categories not found");

    Messages(res, 200, "Detail data categories", findCategories);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! UPDATE CATEGORIES
const updateCategories = async (req, res) => {
  const _id = req.params._id;
  const name = req.body.name;

  const rules = {
    name: "required|min:4|max:20",
  };

  try {
    const findCategories = await ModelCategories.findById({ _id });
    if (!findCategories) return Messages(res, 404, "Data categories not fuound");

    await isValidator({ name }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const filter = { name: { $regex: inputName, $options: "i" } };

      const isSameName = await ModelCategories.findOne(filter);

      if (isSameName) return Messages(res, 400, `${inputName} has been register on system`);

      const updateData = await ModelCategories.findByIdAndUpdate(_id, { name: inputName }, { new: true });

      Messages(res, 200, `Update categories Success`, updateData);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! DELETE CATEGORY
const deleteCategories = async (req, res) => {
  const _id = req.params._id;

  try {
    const findCategories = await ModelCategories.findById({ _id });
    if (!findCategories) return Messages(res, 404, "Data categories not found");

    await ModelCategories.deleteOne({ _id });
    Messages(res, 200, "Delete Categories Success");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

export { createCategories, allCategories, detailCategories, updateCategories, deleteCategories };
