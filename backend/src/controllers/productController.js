const { Product } = require('../models');
const { productSchema } = require('../utils/validator');

const listProducts = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (req.user.role === 'customer') {
      where.is_available = true;
    }
    if (search) {
      where.name = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const products = await Product.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: products.rows, total: products.count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    const product = await Product.create(value);
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: error.details[0].message });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Product not found' });
    }

    await product.update(value);
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Product not found' });
    }

    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Product not found' });
    }

    await product.update({ is_available: !product.is_available });
    res.json({ success: true, data: product, message: `Product ${product.is_available ? 'available' : 'unavailable'}` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleAvailability };
