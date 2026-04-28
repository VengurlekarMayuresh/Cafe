const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Cafe Items',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['is_available'] },
    ],
  });

  Product.associate = (models) => {
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
  };

  return Product;
};
