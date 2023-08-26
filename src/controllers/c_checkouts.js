import ModelCheckout from "../models/m_checkout.js";

import Messages from "../utils/messages.js";
import isValidator from "../utils/validator.js";

// ! CREATE CHECKOUT
const createCheckout = async (req, res) => {
  const body = req.body;

  // create invoice
  const invoice = `INVOICE ${Date.now()}`;

  // data user from res.checkout_use on auth
  const user = { ...res.checkout_user };

  // asigned new property in body request
  body.invoice = invoice;
  body.user = user;
  body.status = false;

  // create rules validate
  const rules = {
    invoice: "required",
    user: {
      _id: "required",
      full_name: "required",
      email: "required",
    },
    cart: "required",
    address: {
      _id: "required",
      name: "required",
    },
    status: "required|boolean",
    total: "required|numeric",
  };

  try {
    await isValidator({ ...body }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });
    });

    await new ModelCheckout(body).save();

    Messages(res, 200, "Create Checkout success", { invoice });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! ALL CHECKOUT
const allCheckout = async (req, res) => {
  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { invoice: { $regex: q, $options: "i" } };
    const total = await ModelCheckout.count(filter);
    const data = await ModelCheckout.find(filter).sort({ _id: sort_key }).skip(pages).limit(per_page);

    const currentTotal = data.map((item) => item.total);

    let total_expenses = undefined;

    if (currentTotal.length) {
      total_expenses = currentTotal.reduce((a, b) => a + b);
    }

    Messages(res, 200, "All Checkout success", { total_expenses, data }, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! HISTORY CEHCKOUT
const historyCheckout = async (req, res) => {
  const _id = req.params._id;

  const q = req.query.q ? req.query.q : "";

  const sort_by = req.query.sort_by ? req.query.sort_by.toLowerCase() : "desc";
  const sort_key = sort_by === "asc" ? 1 : -1;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const per_page = req.query.per_page ? parseInt(req.query.per_page) : 25;

  const pages = page === 1 ? 0 : (page - 1) * per_page;

  try {
    const filter = { invoice: { $regex: q, $options: "i" } };
    const total = await ModelCheckout.count({
      $and: [{ "user._id": _id }, filter],
    });
    const data = await ModelCheckout.find({
      $and: [{ "user._id": _id }, filter],
    })
      .sort({ _id: sort_key })
      .skip(pages)
      .limit(per_page);

    const currentTotal = data.map((item) => item.total);

    let total_expenses = undefined;

    if (currentTotal.length) {
      total_expenses = currentTotal.reduce((a, b) => a + b);
    }

    Messages(res, 200, "History checkout success", { total_expenses, data }, { page, per_page, total });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! DETAIL CHECKOUT
const detailCheckout = async (req, res) => {
  const invoice = req.params.invoice;

  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };

    const findByInvoice = await ModelCheckout.findOne(filter);
    if (!findByInvoice) return Messages(res, 404, "Data checkout not found");

    Messages(res, 200, "Detail data checkout", findByInvoice);
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! CONFIRM/UPDATE CHECKOUT
const confirmCheckout = async (req, res) => {
  const invoice = req.params.invoice;
  const status = req.body.status;

  const rules = {
    status: "required|boolean",
  };

  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };
    const findByInvoice = await ModelCheckout.findOne(filter);

    if (!findByInvoice) return Messages(res, 404, "Data invoice not found");

    await isValidator({ status }, rules, null, async (err, status) => {
      if (!status) return Messages(res, 412, { ...err, status });

      const data = await ModelCheckout.findOneAndUpdate(filter, { status }, { new: true });

      Messages(res, 200, "Confirmation Success", data);
    });
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

// ! DELETE CHECKOUT
const deleteCheckout = async (req, res) => {
  const invoice = req.params.invoice;
  try {
    const filter = { invoice: { $regex: invoice, $options: "i" } };
    const findByInvoice = await ModelCheckout.findOne(filter);
    if (!findByInvoice) return Messages(res, 404, "Data Invoice not found");

    await ModelCheckout.deleteOne(filter);

    Messages(res, 200, "Delete Checkout success");
  } catch (error) {
    Messages(res, 500, error?.message || "Internal Server Error");
  }
};

export { createCheckout, allCheckout, historyCheckout, detailCheckout, confirmCheckout, deleteCheckout };
