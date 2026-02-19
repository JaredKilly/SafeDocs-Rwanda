import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { Organization, User } from '../models';

// ── List all organizations ──────────────────────────────────────
export const getOrganizations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orgs = await Organization.findAll({
      order: [['name', 'ASC']],
    });

    // Get user counts per org
    const counts = await User.findAll({
      attributes: [
        'organizationId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'userCount'],
      ],
      where: { organizationId: { [Op.ne]: null } } as any,
      group: ['organizationId'],
    });
    const countMap: Record<number, number> = {};
    counts.forEach((c: any) => {
      countMap[c.organizationId] = parseInt(c.getDataValue('userCount'), 10);
    });

    const result = orgs.map((org) => ({
      ...org.toJSON(),
      userCount: countMap[org.id] || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('getOrganizations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Get single organization ─────────────────────────────────────
export const getOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id, {
      include: [
        { model: User, as: 'users', attributes: ['id', 'username', 'fullName', 'email', 'role', 'isActive'] },
      ],
    });

    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    res.json(org);
  } catch (error) {
    console.error('getOrganization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Create organization ─────────────────────────────────────────
export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
      return;
    }

    const existing = await Organization.findOne({
      where: { [Op.or]: [{ name }, { slug }] },
    });
    if (existing) {
      res.status(409).json({ error: 'Organization with this name or slug already exists' });
      return;
    }

    const org = await Organization.create({ name, slug, description });
    res.status(201).json({ message: 'Organization created', organization: org });
  } catch (error) {
    console.error('createOrganization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Update organization ─────────────────────────────────────────
export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);
    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    const { name, slug, description, isActive } = req.body;

    if (name !== undefined) org.name = name;
    if (slug !== undefined) {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
        return;
      }
      org.slug = slug;
    }
    if (description !== undefined) org.description = description;
    if (isActive !== undefined) org.isActive = isActive;

    await org.save();
    res.json({ message: 'Organization updated', organization: org });
  } catch (error) {
    console.error('updateOrganization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Delete (deactivate) organization ────────────────────────────
export const deleteOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);
    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    org.isActive = false;
    await org.save();
    res.json({ message: 'Organization deactivated' });
  } catch (error) {
    console.error('deleteOrganization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
