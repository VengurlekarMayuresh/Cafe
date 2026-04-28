const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('customer', 'staff', 'admin'),
      allowNull: false,
      defaultValue: 'customer',
    },
    building: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    flat: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'blocked'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  });

  User.prototype.validatePassword = async function (password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
    User.hasMany(models.Order, { foreignKey: 'handled_by', as: 'handledOrders' });
    User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
  };

  return User;
};
