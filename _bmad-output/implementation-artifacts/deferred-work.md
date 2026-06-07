# Deferred Work

## Deferred from: code review of 2-1-user-registration-with-sms-otp (2026-06-07)

- In-memory OTP lost on server restart [otp-service.js:3] — Known architectural decision; Redis persistence planned for future.
- JWT in localStorage exposes token to XSS [AuthContext.jsx] — Inherent tradeoff of localStorage auth; accepted for v1.
- No login endpoint — Part of Story 2.2 (planned).
- No token refresh mechanism — Future auth work (planned).
- No server-side auth middleware — Coming in future stories.
