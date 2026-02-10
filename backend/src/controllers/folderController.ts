import { Request, Response } from 'express';
import { Folder, User, Document } from '../models';
import { AccessLevel, checkFolderPermission } from '../services/permissionService';

export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, parentId } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Folder name is required' });
      return;
    }

    // Build path
    let path = name;
    if (parentId) {
      const parentFolder = await Folder.findByPk(parentId);
      if (!parentFolder) {
        res.status(404).json({ error: 'Parent folder not found' });
        return;
      }

      const canCreate = await checkFolderPermission(req.user.userId, parentId, AccessLevel.EDITOR);
      if (!canCreate) {
        res.status(403).json({ error: 'You do not have permission to create a subfolder here' });
        return;
      }
      path = `${parentFolder.path}/${name}`;
    }

    const folder = await Folder.create({
      name,
      parentId: parentId || null,
      path,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: 'Folder created successfully',
      folder,
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFolders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { parentId } = req.query;

    const whereClause: any = {};
    if (parentId !== undefined) {
      whereClause.parentId = parentId === 'null' ? null : parentId;
    }

    const folders = await Folder.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
        { model: Folder, as: 'children', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
    });

    const accessibleFolders = [];
    for (const folder of folders) {
      const canView = await checkFolderPermission(
        req.user.userId,
        folder.id,
        AccessLevel.VIEWER
      );
      if (canView) {
        accessibleFolders.push(folder);
      }
    }

    res.status(200).json({ folders: accessibleFolders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFolderById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const folder = await Folder.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
        { model: Folder, as: 'children', attributes: ['id', 'name'] },
        { model: Folder, as: 'parent', attributes: ['id', 'name'] },
        {
          model: Document,
          as: 'documents',
          where: { isDeleted: false },
          required: false,
          attributes: ['id', 'title', 'fileName', 'fileSize', 'mimeType', 'createdAt'],
        },
      ],
    });

    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const hasPermission = await checkFolderPermission(
      req.user.userId,
      Number(id),
      AccessLevel.VIEWER
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to view this folder' });
      return;
    }

    res.status(200).json({ folder });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { name } = req.body;

    const folder = await Folder.findByPk(id);

    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const hasPermission = await checkFolderPermission(
      req.user.userId,
      Number(id),
      AccessLevel.EDITOR
    );

    if (!hasPermission) {
      res.status(403).json({ error: 'You do not have permission to update this folder' });
      return;
    }

    if (name) {
      // Update path
      let newPath = name;
      if (folder.parentId) {
        const parentFolder = await Folder.findByPk(folder.parentId);
        if (parentFolder) {
          newPath = `${parentFolder.path}/${name}`;
        }
      }

      await folder.update({ name, path: newPath });
    }

    res.status(200).json({
      message: 'Folder updated successfully',
      folder,
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const folder = await Folder.findByPk(id, {
      include: [
        { model: Folder, as: 'children' },
        { model: Document, as: 'documents' },
      ],
    });

    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const canDelete =
      req.user.role === 'admin' ||
      (await checkFolderPermission(req.user.userId, Number(id), AccessLevel.OWNER));

    if (!canDelete) {
      res.status(403).json({ error: 'You do not have permission to delete this folder' });
      return;
    }

    // Check if folder has children or documents
    const children = await Folder.count({ where: { parentId: id } });
    const documents = await Document.count({ where: { folderId: id, isDeleted: false } });

    if (children > 0 || documents > 0) {
      res.status(400).json({ error: 'Folder must be empty before deletion' });
      return;
    }

    await folder.destroy();

    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFolderTree = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all root folders (folders without parent)
    const rootFolders = await Folder.findAll({
      where: { parentId: null } as any,
      include: [
        {
          model: Folder,
          as: 'children',
          include: [
            {
              model: Folder,
              as: 'children',
            },
          ],
        },
      ],
      order: [['name', 'ASC']],
    });

    const accessibleRoots = [];
    for (const folder of rootFolders) {
      const canView = await checkFolderPermission(
        req.user.userId,
        folder.id,
        AccessLevel.VIEWER
      );
      if (canView) {
        accessibleRoots.push(folder);
      }
    }

    res.status(200).json({ tree: accessibleRoots });
  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
