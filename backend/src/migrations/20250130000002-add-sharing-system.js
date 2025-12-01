'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create groups table
    await queryInterface.createTable('groups', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create group_members table
    await queryInterface.createTable('group_members', {
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'groups',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('admin', 'member'),
        allowNull: false,
        defaultValue: 'member',
      },
      addedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add composite primary key for group_members
    await queryInterface.addConstraint('group_members', {
      fields: ['groupId', 'userId'],
      type: 'primary key',
      name: 'group_members_pkey',
    });

    // Create indexes for group_members
    await queryInterface.addIndex('group_members', ['groupId']);
    await queryInterface.addIndex('group_members', ['userId']);

    // Create document_permissions table
    await queryInterface.createTable('document_permissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permissionType: {
        type: Sequelize.ENUM('user', 'group', 'role'),
        allowNull: false,
      },
      permissionTargetId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User ID, Group ID, or Role name',
      },
      accessLevel: {
        type: Sequelize.ENUM('viewer', 'commenter', 'editor', 'owner'),
        allowNull: false,
      },
      grantedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      grantedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isRevoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      revokedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      revokedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for document_permissions
    await queryInterface.addIndex('document_permissions', ['documentId']);
    await queryInterface.addIndex('document_permissions', ['permissionType', 'permissionTargetId']);
    await queryInterface.addIndex('document_permissions', ['isRevoked']);
    await queryInterface.addIndex('document_permissions', ['expiresAt']);

    // Create folder_permissions table
    await queryInterface.createTable('folder_permissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      folderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'folders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permissionType: {
        type: Sequelize.ENUM('user', 'group', 'role'),
        allowNull: false,
      },
      permissionTargetId: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      accessLevel: {
        type: Sequelize.ENUM('viewer', 'commenter', 'editor', 'owner'),
        allowNull: false,
      },
      inheritToChildren: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      grantedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      grantedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for folder_permissions
    await queryInterface.addIndex('folder_permissions', ['folderId']);
    await queryInterface.addIndex('folder_permissions', ['permissionType', 'permissionTargetId']);

    // Create share_links table
    await queryInterface.createTable('share_links', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      accessLevel: {
        type: Sequelize.ENUM('viewer', 'commenter'),
        allowNull: false,
        defaultValue: 'viewer',
      },
      maxUses: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentUses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      allowDownload: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for share_links
    await queryInterface.addIndex('share_links', ['token']);
    await queryInterface.addIndex('share_links', ['documentId']);
    await queryInterface.addIndex('share_links', ['isActive']);
    await queryInterface.addIndex('share_links', ['expiresAt']);

    // Create access_requests table
    await queryInterface.createTable('access_requests', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      requesterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      requestedAccess: {
        type: Sequelize.ENUM('viewer', 'commenter', 'editor'),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'denied'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      responseMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for access_requests
    await queryInterface.addIndex('access_requests', ['documentId']);
    await queryInterface.addIndex('access_requests', ['requesterId']);
    await queryInterface.addIndex('access_requests', ['status']);

    // Create file_checksums table
    await queryInterface.createTable('file_checksums', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sha256Hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      algorithm: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'SHA-256',
      },
      calculatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for file_checksums
    await queryInterface.addIndex('file_checksums', ['documentId']);
    await queryInterface.addIndex('file_checksums', ['verificationStatus']);

    // Create encryption_metadata table
    await queryInterface.createTable('encryption_metadata', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'documents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      encryptionAlgorithm: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'AES-256-GCM',
      },
      kmsKeyId: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'AWS KMS Key ID',
      },
      encryptedDataKey: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Encrypted data encryption key',
      },
      iv: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Initialization vector (base64)',
      },
      authTag: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Authentication tag for GCM mode (base64)',
      },
      encryptedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      keyVersion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for encryption_metadata
    await queryInterface.addIndex('encryption_metadata', ['documentId']);
    await queryInterface.addIndex('encryption_metadata', ['kmsKeyId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to respect foreign key constraints
    await queryInterface.dropTable('encryption_metadata');
    await queryInterface.dropTable('file_checksums');
    await queryInterface.dropTable('access_requests');
    await queryInterface.dropTable('share_links');
    await queryInterface.dropTable('folder_permissions');
    await queryInterface.dropTable('document_permissions');
    await queryInterface.dropTable('group_members');
    await queryInterface.dropTable('groups');
  },
};
