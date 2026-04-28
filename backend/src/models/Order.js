const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    order_type: {
      type: DataTypes.ENUM('online', 'onsite'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'delivered', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    handled_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    payment_status: {
      type: DataTypes.ENUM('paid', 'unpaid'),
      defaultValue: 'unpaid',
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['handled_by'] },
      { fields: ['created_at'] },
    ],
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'customer' });
    Order.belongsTo(models.User, { foreignKey: 'handled_by', as: 'handler' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    Order.hasOne(models.Review, { foreignKey: 'order_id', as: 'review' });
  };

  return Order;
};
