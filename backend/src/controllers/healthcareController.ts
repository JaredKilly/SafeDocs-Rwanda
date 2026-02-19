import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Document from '../models/Document';
import AuditLog from '../models/AuditLog';

// Record categories for healthcare documents
export const HC_RECORD_TYPES = [
  'patient_record', 'lab_result', 'prescription', 'consent_form',
  'discharge_summary', 'imaging', 'referral', 'immunization',
  'clinical_note', 'insurance', 'other',
] as const;
export type HCRecordType = typeof HC_RECORD_TYPES[number];

// Privacy levels aligned with Rwanda Data Protection Law
export const HC_PRIVACY_LEVELS = ['general', 'sensitive', 'restricted', 'mental_health', 'hiv_aids'] as const;
export type HCPrivacyLevel = typeof HC_PRIVACY_LEVELS[number];

// ── List healthcare documents accessible to user ──
export const getHealthcareDocs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordType, privacyLevel, patientId, q } = req.query;
    const userId = req.user!.id;
    const role = req.user!.role;

    const where: any = { isDeleted: false, metadata: { [Op.ne]: null } };

    // Non-admin users only see their organization's documents; admins see all
    const orgId = (req.user as any).organizationId;
    if (orgId && role !== 'admin') {
      where.organizationId = orgId;
    }

    const docs = await Document.findAll({ where, order: [['createdAt', 'DESC']], limit: 500 });

    // Filter in JS: only docs with healthcare metadata
    let filtered = docs.filter(d => {
      const m = d.metadata as any;
      if (!m?.hcRecordType && !m?.hcPatientId) return false;

      // Privacy-level access control
      const lvl: HCPrivacyLevel = m.hcPrivacyLevel || 'general';
      if (lvl === 'hiv_aids' && role === 'user') return false;
      if (lvl === 'mental_health' && role === 'user') return false;
      if (lvl === 'restricted' && role === 'user') return false;

      if (recordType && m.hcRecordType !== recordType) return false;
      if (privacyLevel && m.hcPrivacyLevel !== privacyLevel) return false;
      if (patientId && !String(m.hcPatientId || '').toLowerCase().includes(String(patientId).toLowerCase())) return false;
      if (q) {
        const query = String(q).toLowerCase();
        if (
          !d.title.toLowerCase().includes(query) &&
          !String(m.hcPatientId || '').toLowerCase().includes(query) &&
          !String(m.hcPatientName || '').toLowerCase().includes(query) &&
          !String(m.hcFacility || '').toLowerCase().includes(query)
        ) return false;
      }
      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error('getHealthcareDocs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Set healthcare metadata on a document ──
export const setHealthcareMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      hcRecordType,
      hcPrivacyLevel,
      hcPatientId,
      hcPatientName,
      hcFacility,
      hcProvider,
      hcConsentObtained,
      hcRetentionYears,
      hcNotes,
    } = req.body;

    if (hcRecordType && !HC_RECORD_TYPES.includes(hcRecordType)) {
      res.status(400).json({ error: 'Invalid record type' });
      return;
    }
    if (hcPrivacyLevel && !HC_PRIVACY_LEVELS.includes(hcPrivacyLevel)) {
      res.status(400).json({ error: 'Invalid privacy level' });
      return;
    }

    const doc = await Document.findOne({ where: { id, isDeleted: false } });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const existing = (doc.metadata as any) || {};
    const updated = {
      ...existing,
      ...(hcRecordType !== undefined && { hcRecordType }),
      ...(hcPrivacyLevel !== undefined && { hcPrivacyLevel }),
      ...(hcPatientId !== undefined && { hcPatientId }),
      ...(hcPatientName !== undefined && { hcPatientName }),
      ...(hcFacility !== undefined && { hcFacility }),
      ...(hcProvider !== undefined && { hcProvider }),
      ...(hcConsentObtained !== undefined && { hcConsentObtained }),
      ...(hcRetentionYears !== undefined && { hcRetentionYears: Number(hcRetentionYears) }),
      ...(hcNotes !== undefined && { hcNotes }),
    };
    doc.metadata = updated;
    await doc.save();

    await AuditLog.create({
      userId: req.user!.id,
      documentId: doc.id,
      action: 'update',
      details: { message: `Healthcare metadata set: recordType=${hcRecordType ?? existing.hcRecordType}, privacy=${hcPrivacyLevel ?? existing.hcPrivacyLevel}` },
      ipAddress: req.ip,
    });

    res.json({ message: 'Healthcare metadata saved', document: doc });
  } catch (error) {
    console.error('setHealthcareMetadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Remove healthcare metadata ──
export const clearHealthcareMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ where: { id, isDeleted: false } });
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    const existing = (doc.metadata as any) || {};
    const {
      hcRecordType, hcPrivacyLevel, hcPatientId, hcPatientName,
      hcFacility, hcProvider, hcConsentObtained, hcRetentionYears, hcNotes,
      ...rest
    } = existing;
    doc.metadata = Object.keys(rest).length ? rest : undefined;
    await doc.save();

    res.json({ message: 'Healthcare metadata cleared' });
  } catch (error) {
    console.error('clearHealthcareMetadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Stats ──
export const getHealthcareStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const hcStatsWhere: any = { isDeleted: false, metadata: { [Op.ne]: null } };
    const orgId = (req.user as any)?.organizationId;
    const role = (req.user as any)?.role;
    if (orgId && role !== 'admin') {
      hcStatsWhere.organizationId = orgId;
    }
    const docs = await Document.findAll({
      where: hcStatsWhere,
      attributes: ['metadata'],
    });

    const byType: Record<string, number> = {};
    const byPrivacy: Record<string, number> = {};
    let total = 0;
    let noConsent = 0;

    for (const d of docs) {
      const m = d.metadata as any;
      if (!m?.hcRecordType && !m?.hcPatientId) continue;
      total++;
      const t = m.hcRecordType || 'other';
      byType[t] = (byType[t] || 0) + 1;
      const p = m.hcPrivacyLevel || 'general';
      byPrivacy[p] = (byPrivacy[p] || 0) + 1;
      if (!m.hcConsentObtained) noConsent++;
    }

    res.json({ total, byType, byPrivacy, noConsent });
  } catch (error) {
    console.error('getHealthcareStats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
