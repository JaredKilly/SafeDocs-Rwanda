import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Employee, EmployeeDocument, Document, User, AuditLog } from '../models';

// ── Employees ────────────────────────────────────────────────

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, department, status } = req.query;
    const where: any = {};

    // Org scoping: non-admin users only see their org's employees; admins see all
    const orgId = (req.user as any)?.organizationId;
    const role = (req.user as any)?.role;
    if (orgId && role !== 'admin') {
      where.organizationId = orgId;
    }

    if (q) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${q}%` } },
        { employeeId: { [Op.iLike]: `%${q}%` } },
        { department: { [Op.iLike]: `%${q}%` } },
        { position: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }
    if (department) where.department = department;
    if (status) where.status = status;

    const employees = await Employee.findAll({
      where,
      include: [
        { model: EmployeeDocument, as: 'employeeDocuments', attributes: ['id', 'hrCategory'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
      ],
      order: [['fullName', 'ASC']],
    });

    res.json(employees);
  } catch (error) {
    console.error('getEmployees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Document,
          as: 'documents',
          through: { attributes: ['hrCategory', 'addedBy', 'createdAt'] },
          attributes: ['id', 'title', 'fileName', 'fileSize', 'mimeType', 'expiresAt', 'createdAt'],
          where: { isDeleted: false },
          required: false,
        },
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
      ],
    });

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json(employee);
  } catch (error) {
    console.error('getEmployee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, fullName, department, position, email, phone, startDate, endDate, status, notes } = req.body;

    if (!employeeId || !fullName || !department || !position) {
      res.status(400).json({ error: 'employeeId, fullName, department, and position are required' });
      return;
    }

    const existing = await Employee.findOne({ where: { employeeId } });
    if (existing) {
      res.status(409).json({ error: `Employee ID "${employeeId}" already exists` });
      return;
    }

    const employee = await Employee.create({
      employeeId,
      fullName,
      department,
      position,
      email,
      phone,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'active',
      notes,
      createdBy: req.user!.id,
      organizationId: (req.user as any).organizationId ?? undefined,
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('createEmployee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const { fullName, department, position, email, phone, startDate, endDate, status, notes } = req.body;

    if (fullName !== undefined) employee.fullName = fullName;
    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (email !== undefined) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (startDate !== undefined) employee.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) employee.endDate = endDate ? new Date(endDate) : undefined;
    if (status !== undefined) employee.status = status;
    if (notes !== undefined) employee.notes = notes;

    await employee.save();
    res.json(employee);
  } catch (error) {
    console.error('updateEmployee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    // Remove junction records first
    await EmployeeDocument.destroy({ where: { employeeId: employee.id } });
    await employee.destroy();
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('deleteEmployee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Employee ↔ Document linking ───────────────────────────────

export const linkDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { documentId, hrCategory = 'other' } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) { res.status(404).json({ error: 'Employee not found' }); return; }

    const doc = await Document.findOne({ where: { id: documentId, isDeleted: false } });
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    const [link, created] = await EmployeeDocument.findOrCreate({
      where: { employeeId: employee.id, documentId },
      defaults: { employeeId: employee.id, documentId, hrCategory, addedBy: req.user!.id },
    });

    if (!created) {
      // Update category if already linked
      link.hrCategory = hrCategory;
      await link.save();
    }

    res.status(created ? 201 : 200).json(link);
  } catch (error) {
    console.error('linkDocument error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unlinkDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, documentId } = req.params;
    const deleted = await EmployeeDocument.destroy({
      where: { employeeId: id, documentId },
    });
    if (!deleted) { res.status(404).json({ error: 'Link not found' }); return; }
    res.json({ message: 'Document unlinked' });
  } catch (error) {
    console.error('unlinkDocument error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── HR Document Classification (by Organization) ──────────────

export const HR_CATEGORIES = [
  'contract', 'id_copy', 'certificate', 'performance_review',
  'onboarding', 'medical', 'payslip', 'other',
] as const;

export const getHRDocs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, organization, hrCategory } = req.query;

    const where: any = {
      isDeleted: false,
      metadata: { [Op.ne]: null },
    };

    // Org scoping: non-admin users only; admins see all
    const hrOrgId = (req.user as any).organizationId;
    const hrRole = (req.user as any)?.role;
    if (hrOrgId && hrRole !== 'admin') {
      where.organizationId = hrOrgId;
    }

    const docs = await Document.findAll({ where, order: [['createdAt', 'DESC']], limit: 200 });

    const filtered = docs.filter(d => {
      const m = d.metadata as any;
      if (!m?.hrOrganization && !m?.hrCategory) return false;
      if (organization && m.hrOrganization !== organization) return false;
      if (hrCategory && m.hrCategory !== hrCategory) return false;
      if (q) {
        const query = String(q).toLowerCase();
        if (!d.title.toLowerCase().includes(query) &&
          !String(m.hrOrganization || '').toLowerCase().includes(query) &&
          !String(m.hrDepartment || '').toLowerCase().includes(query)) return false;
      }
      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error('getHRDocs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const setHRDocMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { hrOrganization, hrDepartment, hrCategory } = req.body;

    const doc = await Document.findOne({ where: { id, isDeleted: false } });
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    const existing = (doc.metadata as any) || {};
    const updated = {
      ...existing,
      ...(hrOrganization !== undefined && { hrOrganization }),
      ...(hrDepartment !== undefined && { hrDepartment }),
      ...(hrCategory !== undefined && { hrCategory }),
    };
    doc.metadata = updated;
    await doc.save();

    await AuditLog.create({
      userId: req.user!.id,
      documentId: doc.id,
      action: 'update',
      details: { message: `HR metadata updated: org=${hrOrganization}, category=${hrCategory}` },
      ipAddress: req.ip,
    });

    res.json({ message: 'HR document metadata saved', document: doc });
  } catch (error) {
    console.error('setHRDocMetadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const clearHRDocMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ where: { id, isDeleted: false } });
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    const existing = (doc.metadata as any) || {};
    const { hrOrganization, hrDepartment, hrCategory, ...rest } = existing;
    doc.metadata = Object.keys(rest).length ? rest : undefined;
    await doc.save();

    res.json({ message: 'HR document metadata cleared' });
  } catch (error) {
    console.error('clearHRDocMetadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── HR Dashboard Stats ────────────────────────────────────────

export const getHRStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const in30 = new Date(now); in30.setDate(now.getDate() + 30);
    const in60 = new Date(now); in60.setDate(now.getDate() + 60);

    // Org scoping for employee counts: non-admin users only; admins see all
    const statsOrgId = (req.user as any)?.organizationId;
    const statsRole = (req.user as any)?.role;
    const empWhere: any = {};
    if (statsOrgId && statsRole !== 'admin') {
      empWhere.organizationId = statsOrgId;
    }

    const [total, active, inactive, terminated] = await Promise.all([
      Employee.count({ where: empWhere }),
      Employee.count({ where: { ...empWhere, status: 'active' } }),
      Employee.count({ where: { ...empWhere, status: 'inactive' } }),
      Employee.count({ where: { ...empWhere, status: 'terminated' } }),
    ]);

    // Documents expiring via HR links (scoped by org for non-admins)
    const expiringDocs = await EmployeeDocument.findAll({
      include: [
        {
          model: Document,
          as: 'document',
          where: {
            isDeleted: false,
            expiresAt: { [Op.between]: [now, in60] },
          },
          attributes: ['id', 'title', 'expiresAt', 'fileName'],
        },
        {
          model: Employee,
          as: 'employee',
          where: empWhere,
          attributes: ['id', 'employeeId', 'fullName', 'department'],
        },
      ],
      order: [[{ model: Document, as: 'document' }, 'expiresAt', 'ASC']],
    });

    const departments = await Employee.findAll({
      where: empWhere,
      attributes: ['department'],
      group: ['department'],
      order: [['department', 'ASC']],
    });

    res.json({
      stats: { total, active, inactive, terminated },
      expiringDocuments: expiringDocs,
      departments: departments.map((d: any) => d.department),
    });
  } catch (error) {
    console.error('getHRStats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
