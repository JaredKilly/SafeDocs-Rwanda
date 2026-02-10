import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Document from '../models/Document';
import AuditLog from '../models/AuditLog';

// Classification levels (Rwanda government standard)
export const CLASSIFICATION_LEVELS = ['public', 'internal', 'restricted', 'confidential', 'top_secret'] as const;
export type ClassificationLevel = typeof CLASSIFICATION_LEVELS[number];

// Standard retention periods in years (0 = permanent)
export const RETENTION_PERIODS = [1, 3, 5, 7, 10, 15, 20, 0] as const;

// ── Get all government metadata for documents accessible to the user ──
export const getGovDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classification, refNumber, q } = req.query;
    const userId = req.user!.id;
    const role = req.user!.role;

    const where: any = {
      isDeleted: false,
      // Only show docs with gov metadata (refNumber stored in metadata JSON)
      metadata: { [Op.ne]: null },
    };

    // Regular users only see their own gov docs
    if (role === 'user') {
      where.uploadedBy = userId;
    }

    const docs = await Document.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    // Filter by gov-specific metadata fields in JS (since metadata is JSON)
    let filtered = docs.filter(d => {
      const m = d.metadata as any;
      if (!m?.govRef && !m?.classification) return false; // not a gov doc
      if (classification && m.classification !== classification) return false;
      if (refNumber && !String(m.govRef || '').toLowerCase().includes(String(refNumber).toLowerCase())) return false;
      if (q) {
        const query = String(q).toLowerCase();
        if (!d.title.toLowerCase().includes(query) &&
          !String(m.govRef || '').toLowerCase().includes(query) &&
          !String(m.subject || '').toLowerCase().includes(query)) return false;
      }
      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error('getGovDocuments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Set government metadata on a document ──
export const setGovMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      classification,
      govRef,
      subject,
      issuingAuthority,
      retentionYears,
      sensitivityJustification,
    } = req.body;

    if (classification && !CLASSIFICATION_LEVELS.includes(classification)) {
      res.status(400).json({ error: 'Invalid classification level' });
      return;
    }

    const doc = await Document.findOne({ where: { id, isDeleted: false } });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Merge into existing metadata
    const existing = (doc.metadata as any) || {};
    const updated = {
      ...existing,
      ...(classification !== undefined && { classification }),
      ...(govRef !== undefined && { govRef }),
      ...(subject !== undefined && { subject }),
      ...(issuingAuthority !== undefined && { issuingAuthority }),
      ...(retentionYears !== undefined && { retentionYears: Number(retentionYears) }),
      ...(sensitivityJustification !== undefined && { sensitivityJustification }),
    };
    doc.metadata = updated;
    await doc.save();

    // Audit log
    await AuditLog.create({
      userId: req.user!.id,
      documentId: doc.id,
      action: 'update',
      details: { message: `Government metadata updated: classification=${classification ?? existing.classification}` },
      ipAddress: req.ip,
    });

    res.json({ message: 'Government metadata saved', document: doc });
  } catch (error) {
    console.error('setGovMetadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Remove government metadata from a document ──
export const clearGovMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ where: { id, isDeleted: false } });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const existing = (doc.metadata as any) || {};
    const { classification, govRef, subject, issuingAuthority, retentionYears, sensitivityJustification, ...rest } = existing;
    doc.metadata = Object.keys(rest).length ? rest : undefined;
    await doc.save();

    res.json({ message: 'Government metadata cleared' });
  } catch (error) {
    console.error('clearGovMetadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Stats: classification breakdown ──
export const getGovStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const docs = await Document.findAll({
      where: { isDeleted: false, metadata: { [Op.ne]: null } },
      attributes: ['metadata'],
    });

    const counts: Record<string, number> = { public: 0, internal: 0, restricted: 0, confidential: 0, top_secret: 0, unclassified: 0 };
    let govTotal = 0;

    for (const d of docs) {
      const m = d.metadata as any;
      if (!m?.classification && !m?.govRef) continue;
      govTotal++;
      const lvl = m.classification || 'unclassified';
      counts[lvl] = (counts[lvl] || 0) + 1;
    }

    res.json({ total: govTotal, byClassification: counts });
  } catch (error) {
    console.error('getGovStats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
