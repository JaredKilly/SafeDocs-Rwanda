'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create organizations table
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Add organizationId to users
    await queryInterface.addColumn('users', 'organizationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('users', ['organizationId']);

    // 3. Add organizationId to documents
    await queryInterface.addColumn('documents', 'organizationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('documents', ['organizationId']);

    // 4. Add organizationId to folders
    await queryInterface.addColumn('folders', 'organizationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('folders', ['organizationId']);

    // 5. Add organizationId to media_items
    await queryInterface.addColumn('media_items', 'organizationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('media_items', ['organizationId']);

    // 6. Add organizationId to employees
    await queryInterface.addColumn('employees', 'organizationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'organizations', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addIndex('employees', ['organizationId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('employees', 'organizationId');
    await queryInterface.removeColumn('media_items', 'organizationId');
    await queryInterface.removeColumn('folders', 'organizationId');
    await queryInterface.removeColumn('documents', 'organizationId');
    await queryInterface.removeColumn('users', 'organizationId');
    await queryInterface.dropTable('organizations');
  },
};
