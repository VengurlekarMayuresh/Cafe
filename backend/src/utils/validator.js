const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().pattern(/^[0-9]{10,20}$/).required(),
  password: Joi.string().min(8).alphanum().required(),
  building: Joi.string().max(100).allow(''),
  flat: Joi.string().max(100).allow(''),
});

const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10,20}$/).required(),
  password: Joi.string().required(),
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      qty: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});

const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  price: Joi.number().positive().required(),
  is_available: Joi.boolean(),
});

const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow(''),
});

module.exports = { registerSchema, loginSchema, createOrderSchema, productSchema, reviewSchema };
