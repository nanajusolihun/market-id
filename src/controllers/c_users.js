import ModelUsers from "../models/m_users.js";
import ModelRoles from "../models/m_roles.js";

import Cloudinary from "../config/cloudinary.js";
import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/secret.js";

// ! CREATE | REGISTER USERS
const registerUser = async (req, res) => {
  const body = req.body;

  let rules = {
    full_name: "required|min:6|max:25",
    email: "required|email",
    password: "required|min:8|max:12",
  };

  await isValidator(body, rules, null, async (err, status) => {
    if (!status) return Messages(res, 412, { ...err, status });

    const findByEmail = await ModelUsers.findOne({ email: body.email });
    if (findByEmail) return Messages(res, 404, "Email has been Register");

    const findRole = await ModelRoles.findOne({ name: "customer" });
    if (!findRole) return Messages(res, 404, "Role Not Found");

    // Hash Pasword with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(body.password, salt);

    await new ModelUsers({
      ...body,
      full_name: body.full_name.trim(),
      password,
      image: {
        url: null,
        cloudinary_id: null,
      },
      role: {
        _id: findRole._id,
        name: findRole.name,
      },
      status: true,
      token: null,
    }).save();

    Messages(res, 200, "Register Success");
  });
};

//! LOGIN USER
const loginUser = async (req, res) => {
  const body = req.body;

  const rules = {
    email: "required|email",
    password: "required|min:8|max:12",
  };

  try {
    await isValidator(body, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const findByEmail = await ModelUsers.findOne({ email: body.email });

      if (!findByEmail) return Messages(res, 400, "Email not Register");

      // compare password with bcrypt
      const isHashPassword = findByEmail.password;
      const comparePassword = bcrypt.compareSync(body.password, isHashPassword);

      if (!comparePassword) return Messages(res, 400, "Password is wrong, please check again");

      // check status account user
      const isStatus = findByEmail.status;
      if (!isStatus) return Messages(res, 400, "Your account is being deactivated");

      // Variabel id user
      const _id = findByEmail._id;

      // encoded jwt
      const payload = {
        _id: findByEmail._id,
        role: {
          _id: findByEmail.role._id,
          name: findByEmail.role.name,
        },
        full_name: findByEmail.full_name,
        email: findByEmail.email,
      };

      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });

      await ModelUsers.findByIdAndUpdate(_id, { token }, { new: true });

      Messages(res, 200, "Login Success", { _id, token, role: { ...findByEmail.role } });
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! LOGOUT USER
const logoutUser = async (req, res) => {
  const _id = req.params._id;

  try {
    const findData = await ModelUsers.findById({ _id });
    if (!findData) return Messages(res, 404, "User not Found");

    await ModelUsers.findByIdAndUpdate(_id, { token: null }, { new: true });

    Messages(res, 200, "Logout Success");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

//! READ ALL DATA USERS
const getAllData = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "asc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { full_name: { $regex: q, $options: "i" } };

    const total = await ModelUsers.count(filter);
    const data = await ModelUsers.find(filter).sort({ _id: sort_key }).skip(pages).limit(per_page);

    // Delete properti password
    const newData = data.map((item) => {
      delete item._doc.password;
      return {
        ...item._doc,
      };
    });

    Messages(res, 200, "get All role", data, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! DEATIL DATA USERS
const detailUser = async (req, res) => {
  const _id = req.params._id;

  try {
    const findUser = await ModelUsers.findById({ _id });
    if (!findUser) return Messages(res, 404, "Data User not Found");

    // delete properti password
    delete findUser._doc.password;

    Messages(res, 200, "Detail User", findUser);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! UPDATE DATA USERS
const updateUser = async (req, res) => {
  const _id = req.params._id;
  const body = req.body;
  const file = req.file;

  const rules = {
    full_name: ["required", "min:4", "max:30"],
    status: "required|boolean",
  };

  try {
    const findUser = await ModelUsers.findById({ _id });
    if (!findUser) return Messages(res, 404, "Datas user not found");

    await isValidator(body, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      // upload image
      const payload_img = {};

      if (file) {
        const user_image = findUser._doc.image.url;
        const user_cloudinary_id = findUser._doc.image.cloudinary_id;

        // delete image from cloudinary id
        if (user_image) await Cloudinary.uploader.destroy(user_cloudinary_id);

        // upload new image to cloudinary
        const result = await Cloudinary.uploader.upload(file.path);

        // assigned data secule_url & public_id to key image
        payload_img.image = {
          url: result.secure_url,
          cloudinary_id: result.public_id,
        };
      }

      const payload = { ...payload_img, ...body, full_name: req.body.full_name.trim() };

      const updateData = await ModelUsers.findByIdAndUpdate(_id, payload, { new: true });

      delete updateData._doc.password;
      Messages(res, 200, "Update data user Success", updateData);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

// ! DELETE USERS
const deleteUser = async (req, res) => {
  const _id = req.params._id;

  try {
    const findUser = await ModelUsers.findById({ _id });
    if (!findUser) return Messages(res, 404, "Data user not found");

    const user_image = findUser._doc.image.url;
    const user_cloudinary_id = findUser._doc.image.cloudinary_id;

    // delete image from cloudinary
    if (user_image) await Cloudinary.uploader.destroy(user_cloudinary_id);

    await ModelUsers.deleteOne({ _id });

    Messages(res, 200, "Delete data user Success");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal server error");
  }
};

export { registerUser, loginUser, getAllData, logoutUser, detailUser, updateUser, deleteUser };
