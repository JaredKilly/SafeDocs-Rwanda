import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Employee, EmployeeDocument, Document, User } from '../models';

// ── Employees ────────────────────────────────────────────────

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, department, status } = req.query;
    const where: any = {};

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

// ── HR Dashboard Stats ────────────────────────────────────────

export const getHRStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const in30 = new Date(now); in30.setDate(now.getDate() + 30);
    const in60 = new Date(now); in60.setDate(now.getDate() + 60);

    const [total, active, inactive, terminated] = await Promise.all([
      Employee.count(),
      Employee.count({ where: { status: 'active' } }),
      Employee.count({ where: { status: 'inactive' } }),
      Employee.count({ where: { status: 'terminated' } }),
    ]);

    // Documents expiring via HR links
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
          attributes: ['id', 'employeeId', 'fullName', 'department'],
        },
      ],
      order: [[{ model: Document, as: 'document' }, 'expiresAt', 'ASC']],
    });

    const departments = await Employee.findAll({
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
