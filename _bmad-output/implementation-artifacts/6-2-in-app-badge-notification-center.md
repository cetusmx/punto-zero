# Story 6.2: In-App Badge Notification Center

Status: review

## Story

As a user or admin,
I want to receive in-app notifications via a bell icon with an unread counter,
so that I am aware of program events without SMS overload.

## Acceptance Criteria

1. **Bell Icon and Unread Counter (AC: #1):**
   - **Given** I am authenticated,
   - **Then** I see a bell icon in the app shell navbar with a counter showing the number of unread notifications.

2. **Falta Notification (AC: #2):**
   - **Given** a falta is registered for me,
   - **Then** I receive a badge notification.

3. **Status Change Notification to Admin (AC: #3):**
   - **Given** I change my Estatus (user-initiated),
   - **Then** the admin receives a badge notification.

4. **Point Inactivation Notification (AC: #4):**
   - **Given** a collection point is inactivated with affected schedulings,
   - **Then** affected users receive a badge notification.

5. **QR Expiry Notification (AC: #5):**
   - **Given** my QR Exención is approaching expiry,
   - **Then** I receive badge notifications at 30 days, 7 days, and on the day of expiry.

6. **Reset 3-Falta Notification (AC: #6):**
   - **Given** my attendance count resets due to 3 faltas,
   - **Then** I receive a badge notification.

7. **Reading Notifications (AC: #7):**
   - **Given** I open the notification panel and read a notification,
   - **Then** the unread counter decreases.

8. **Admin Notifications (AC: #8):**
   - **Given** I am an admin,
   - **Then** I see both admin-specific notifications (status changes, Friday cancellations) and system notifications.

9. **Volunteer Notifications (AC: #9):**
   - **Given** I am a volunteer,
   - **Then** I see only my personal notifications (faltas, QR expiry, resets).

10. **Empty State (AC: #10):**
    - **Given** there are zero total notifications (read and unread),
    - **Then** I see an empty state: "No hay novedades. Te avisaremos cuando tengas algo nuevo."

## Tasks / Subtasks

### Server-Side (Express + Prisma)
- [x] **Create Notifications Controller (`server/src/controllers/notifications-controller.js`)**
  - Implement `getUnreadCount`: A lightweight endpoint returning only `{ unreadCount: number }` for the current user to be used in frequent polling.
  - Implement `getNotifications`: Fetch all `NotificationBadge` records where `userId` equals `req.user.id`, ordered by `createdAt` descending. Limit to the latest 50 notifications to prevent payload bloat.
  - Implement `markAsRead`: Accept `id` in params. Update `NotificationBadge` `read` field to `true` where `id` equals params `id` and `userId` equals `req.user.id`.
  - Implement `markAllAsRead`: Update `NotificationBadge` `read` field to `true` where `userId` equals `req.user.id` and `read` is `false`.
- [x] **Create Notifications Routes (`server/src/routes/notifications-routes.js`)**
  - Register `GET /unread-count`, `GET /`, `PATCH /:id/read`, and `PATCH /read-all` endpoints pointing to the controller methods. Use `authenticate` middleware.
- [x] **Register Routes in App (`server/index.js`)**
  - Import `notificationsRoutes`.
  - Add `app.use('/api/v1/notifications', notificationsRoutes);`
- [x] **Fix `expiry-cron.js` Bug & Data Retention (`server/src/jobs/expiry-cron.js`)**
  - The cron currently references `prisma.notification`, which does not exist. Change ALL references of `prisma.notification.create` and `prisma.notification.findFirst` to `prisma.notificationBadge.create` and `prisma.notificationBadge.findFirst`.
  - Update payload schema to match `NotificationBadge` (needs `category`, `title`, `message`). E.g. set `category: 'system'`.
  - **Data Retention:** Inside the cron, add a cleanup query to delete all `NotificationBadge` records that are older than 30 days (`createdAt < 30 days ago`) to prevent the table from growing infinitely.
- [x] **Database Cleanup (`server/prisma/schema.prisma`)**
  - Remove the unused `model Badge` from the schema, as all current features (admin cancel, point inactivation, estatus change) are correctly using `model NotificationBadge`. Ensure to run Prisma migration if needed.

### Client-Side (React + MUI)
- [x] **Notifications Context or Hook (`client/src/hooks/useNotifications.js` OR `NotificationContext.jsx`)**
  - Create a hook to manage the state of notifications.
  - Implement a `setInterval` (e.g., every 60 seconds) that pulls from the lightweight `GET /api/v1/notifications/unread-count` endpoint to keep the unread badge up-to-date without fetching full history.
  - Fetch `GET /api/v1/notifications` only when the user explicitly opens the notification panel.
  - Provide functions to `markAsRead` and `markAllAsRead`.
- [x] **BadgeCenter Component (`client/src/components/notifications/BadgeCenter.jsx`)**
  - Create a Bell Icon wrapped in an MUI `<Badge>` passing the count of `unread` notifications to `badgeContent`.
  - Clicking the icon should open an MUI `<Popover>` or `<Drawer>`.
  - Display the list of notifications, emphasizing unread ones (e.g., with a different background or bold font).
  - Show the empty state ("No hay novedades. Te avisaremos cuando tengas algo nuevo.") when the list is empty.
- [x] **Integrate BadgeCenter into AppShell (`client/src/layouts/AppShell.jsx`)**
  - Add the `BadgeCenter` component into the top AppBar (e.g., next to the user profile avatar/menu). Make sure it correctly pulls the current authenticated user's notifications.

## Dev Notes

### Architecture & Backend Implementation Status (CRITICAL)
Many notification events described in the ACs **are already implemented** in previous epics via the `prisma.notificationBadge.create` method. **Do not reinvent them**:
- **AC #2 (Falta) & AC #6 (3-Falta Reset)**: Already implemented in `server/src/controllers/admin-agenda-controller.js` (lines 100-125).
- **AC #3 (Status Change)**: Already implemented in `server/src/controllers/auth-controller.js` (line ~289).
- **AC #4 (Point Inactivation)**: Already implemented in `server/src/controllers/collection-points-controller.js` (line ~100).

Your focus on the backend should purely be creating the missing `GET`, `PATCH` read endpoints, and fixing the `expiry-cron.js` bug. 

### The `expiry-cron.js` Bug Fix
The job `server/src/jobs/expiry-cron.js` was written referencing `prisma.notification.create`. This breaks because the table is `notification_badges` (mapped to `NotificationBadge` in Prisma). You MUST refactor `expiry-cron.js` to use `prisma.notificationBadge.create`. The required fields for `NotificationBadge` are `userId`, `category`, `title`, and `message`. You can set `category: 'system'`.

### Polling / Real-time Updates
Given the UX and Architecture specifications mention "DB pull, no push", you should implement simple polling in the frontend rather than WebSockets. A `useEffect` with a `setInterval` (e.g., every 60 seconds) pulling `GET /api/v1/notifications` inside the context/hook is perfectly sufficient to keep the unread badge up-to-date.

### Visual Design Patterns
- Unread notifications should have a distinct visual indicator (e.g., blue dot or bold text) per the design spec.
- Incorporate time elapsed formatting for `createdAt` (e.g., "Hace 2 horas" or "Ayer"). Consider using `date-fns` `formatDistanceToNow` with Spanish locale.
- Allow users to mark all as read or mark individual items as read.

## Dev Agent Record
- **Implementation Notes**: All requirements implemented successfully. Prisma migration could not be run due to terminal wait timeout, but the `schema.prisma` file is updated and ready for migration. Backend controllers and routes were created in ESM style to match the project configuration. On the frontend, `NotificationContext` polling was implemented and `BadgeCenter` was injected into the AppBar of `AdminLayout` and a newly created AppBar in `VolunteerLayout`.
- **Completion Notes**: Story 6.2 is fully implemented and ready for review.

## File List
- `server/prisma/schema.prisma` (Modified)
- `server/src/controllers/notifications-controller.js` (New)
- `server/src/routes/notifications-routes.js` (New)
- `server/index.js` (Modified)
- `server/src/jobs/expiry-cron.js` (Modified)
- `client/src/context/NotificationContext.jsx` (Modified)
- `client/src/components/notifications/BadgeCenter.jsx` (New)
- `client/src/layouts/AdminLayout.jsx` (Modified)
- `client/src/layouts/VolunteerLayout.jsx` (Modified)

## Change Log
- Removed `Badge` model from Prisma schema.
- Added API endpoints for retrieving unread count, notifications, and marking them read.
- Fixed `expiry-cron.js` to use `NotificationBadge` properly.
- Added 60s polling for unread badge updates in frontend context.
- Implemented `BadgeCenter` popover.
- Integrated `BadgeCenter` into all App Shell layouts.

### Review Findings
- [x] [Review][Patch] Unhandled NaN for req.params.id in markAsRead (`server/src/controllers/notifications-controller.js:40`)
- [x] [Review][Patch] Expiry cron may miss notifications for renewed certificates (`server/src/jobs/expiry-cron.js:76`)
