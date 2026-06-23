import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await prisma.notificationBadge.count({
      where: {
        userId: req.user.id,
        read: false,
      },
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notificationBadge.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id, 10);
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: { message: 'Invalid notification ID' } });
    }
    await prisma.notificationBadge.updateMany({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
      data: {
        read: true,
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notificationBadge.updateMany({
      where: {
        userId: req.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
