import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Notification, User } from '../models';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where: any = { recipientId: (req.user as any).userId };
    if (unreadOnly) where.isRead = false;

    const { rows: notifications, count: total } = await Notification.findAndCountAll({
      where,
      include: [{ model: User, as: 'actor', attributes: ['id', 'username', 'fullName'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Notification.count({
      where: { recipientId: (req.user as any).userId, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    if (notification.recipientId !== (req.user as any).userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await notification.update({ isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('markRead error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const [count] = await Notification.update(
      { isRead: true },
      { where: { recipientId: (req.user as any).userId, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read', count });
  } catch (error) {
    console.error('markAllRead error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
