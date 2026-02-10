'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('document_versions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'documents', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      storageType: {
        type: Sequelize.ENUM('local', 'minio'),
        allowNull: false,
        defaultValue: 'local',
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      changeNote: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('document_versions', ['documentId']);
    await queryInterface.addIndex('document_versions', ['documentId', 'versionNumber']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('document_versions');
  },
};
