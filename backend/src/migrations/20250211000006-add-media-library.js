'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('media_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fileName: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      filePath: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      mediaType: {
        type: Sequelize.ENUM('image', 'video'),
        allowNull: false,
      },
      storageType: {
        type: Sequelize.ENUM('local', 'minio'),
        allowNull: false,
        defaultValue: 'local',
      },
      thumbnailPath: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      duration: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM('general', 'marketing', 'training', 'event', 'documentation', 'other'),
        allowNull: false,
        defaultValue: 'general',
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
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

    await queryInterface.addIndex('media_items', ['mediaType']);
    await queryInterface.addIndex('media_items', ['category']);
    await queryInterface.addIndex('media_items', ['uploadedBy']);
    await queryInterface.addIndex('media_items', ['isDeleted']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('media_items');
  },
};
