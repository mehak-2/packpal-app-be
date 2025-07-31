import Notification from "../models/Notification.js";
import ReminderSettings from "../models/ReminderSettings.js";
import Trip from "../models/Trip.js";
import { sendEmail } from "../services/emailService.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate("tripId", "destination country startDate endDate")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read"
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read"
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification"
    });
  }
};

export const getReminderSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    let settings = await ReminderSettings.findOne({ userId });
    
    if (!settings) {
      settings = new ReminderSettings({ userId });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error fetching reminder settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reminder settings"
    });
  }
};

export const updateReminderSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const settings = await ReminderSettings.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: settings,
      message: "Reminder settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating reminder settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reminder settings"
    });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, tripId, icon, scheduledFor, metadata } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      tripId,
      icon,
      scheduledFor,
      metadata
    });

    await notification.save();

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification"
    });
  }
};

export const scheduleTripReminders = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId).populate("userId");
    if (!trip) return;

    const settings = await ReminderSettings.findOne({ userId: trip.userId });
    if (!settings || !settings.emailNotifications) return;

    const tripStartDate = new Date(trip.startDate);
    const reminderDate = new Date(tripStartDate);
    reminderDate.setDate(reminderDate.getDate() - settings.tripReminderDays);

    const [hours, minutes] = settings.tripReminderTime.split(":");
    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (reminderDate > new Date()) {
      await Notification.create({
        userId: trip.userId,
        tripId: trip._id,
        type: "trip_reminder",
        title: `Trip to ${trip.destination} starts soon`,
        message: `Your trip to ${trip.destination}, ${trip.country} starts in ${settings.tripReminderDays} day(s). Don't forget to pack!`,
        icon: "airplane",
        scheduledFor: reminderDate
      });
    }

    const packingReminderDate = new Date(tripStartDate);
    packingReminderDate.setDate(packingReminderDate.getDate() - settings.packingReminderDays);

    const [packingHours, packingMinutes] = settings.packingReminderTime.split(":");
    packingReminderDate.setHours(parseInt(packingHours), parseInt(packingMinutes), 0, 0);

    if (packingReminderDate > new Date()) {
      await Notification.create({
        userId: trip.userId,
        tripId: trip._id,
        type: "packing_reminder",
        title: `Pack your essentials for ${trip.destination}`,
        message: `Time to pack your essentials for your trip to ${trip.destination}. Check your packing list!`,
        icon: "suitcase",
        scheduledFor: packingReminderDate
      });
    }
  } catch (error) {
    console.error("Error scheduling trip reminders:", error);
  }
};

export const sendScheduledNotifications = async () => {
  try {
    const now = new Date();
    const scheduledNotifications = await Notification.find({
      scheduledFor: { $lte: now },
      sentAt: { $exists: false }
    }).populate("userId").populate("tripId");

    for (const notification of scheduledNotifications) {
      try {
        if (notification.userId.email) {
          await sendEmail({
            to: notification.userId.email,
            subject: notification.title,
            template: "notification",
            data: {
              title: notification.title,
              message: notification.message,
              tripDestination: notification.tripId?.destination
            }
          });
        }

        notification.sentAt = new Date();
        await notification.save();
      } catch (error) {
        console.error(`Error sending notification ${notification._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error sending scheduled notifications:", error);
  }
};