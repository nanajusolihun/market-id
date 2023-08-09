import ModelRoles from "../models/m_roles.js";

import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

// Create data role
const createRoles = async (req, res) => {
  const name = req.body.name;

  const rules = {
    name: "required|min:6|max:25",
  };

  try {
    await isValidator({ name }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const filter = { name: { $regex: inputName, $options: "i" } };
      const isSameName = await ModelRoles.findOne(filter);

      if (isSameName) return Messages(res, 400, `${inputName} has been register on system`);

      // Create data roles
      await new ModelRoles({ name: inputName }).save();

      Messages(res, 201, "Register Success", isSameName);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// Read Data role
const allRole = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "asc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { name: { $regex: q, $options: "i" } };

    const total = await ModelRoles.count(filter);
    const data = await ModelRoles.find(filter).sort({ _id: sort_key }).skip(pages).limit(per_page);

    Messages(res, 200, "get All role", data, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// get detail role
const detailRole = async (req, res) => {
  const _id = req.params._id;

  try {
    const findData = await ModelRoles.findById({ _id });
    if (!findData) return Messages(res, 404, "Data not Found");

    Messages(res, 200, "Detail data role", findData);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// Update data Role
const updateRole = async (req, res) => {
  const _id = req.params._id;
  const name = req.body.name;

  const rules = {
    name: "required|min:6|max:25",
  };

  try {
    const findData = await ModelRoles.findById({ _id });
    if (!findData) return Messages(res, 404, "Data not Found");

    await isValidator({ name }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const inputName = name.toLowerCase().trim();
      const payload = { name: inputName };
      const updateData = await ModelRoles.findByIdAndUpdate(_id, payload, { new: true });

      Messages(res, 200, "Update Success", updateData);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// Delete data role
const deletRole = async (req, res) => {
  const _id = req.params._id;

  try {
    const findData = await ModelRoles.findById({ _id });
    if (!findData) return Messages(res, 404, "Data no Found");

    await ModelRoles.deleteOne(findData);

    Messages(res, 200, "Delete data role Succes", findData);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

export { createRoles, allRole, detailRole, updateRole, deletRole };
