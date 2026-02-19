import Notification from '../models/Notification';

export enum NotificationType {
  DOCUMENT_SHARED = 'document_shared',
  ACCESS_REQUEST_SUBMITTED = 'access_request_submitted',
  ACCESS_REQUEST_APPROVED = 'access_request_approved',
  ACCESS_REQUEST_DENIED = 'access_request_denied',
  DOCUMENT_REVIEW_SUBMITTED = 'document_review_submitted',
  DOCUMENT_REVIEW_APPROVED = 'document_review_approved',
  DOCUMENT_REVIEW_REJECTED = 'document_review_rejected',
}

interface CreateNotificationParams {
  recipientId: number;
  type: NotificationType;
  title: string;
  message?: string;
  relatedId?: number;
  relatedType?: 'document' | 'access_request' | 'share';
  actorId?: number;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    if (params.actorId && params.actorId === params.recipientId) return;
    await Notification.create(params);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function createBulkNotifications(
  recipientIds: number[],
  params: Omit<CreateNotificationParams, 'recipientId'>
): Promise<void> {
  try {
    const notifications = recipientIds
      .filter((id) => id !== params.actorId)
      .map((recipientId) => ({ ...params, recipientId }));
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
  }
}
