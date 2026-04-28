const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { listProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleAvailability } = require('../controllers/productController');
const { upload } = require('../utils/cloudinary');

router.get('/', authenticate, listProducts);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, authorize('staff', 'admin'), upload.single('image'), createProduct);
router.put('/:id', authenticate, authorize('staff', 'admin'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.patch('/:id/toggle', authenticate, authorize('staff', 'admin'), toggleAvailability);

module.exports = router;
