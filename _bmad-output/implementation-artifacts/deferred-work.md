# Deferred Work

## Deferred from: code review of 2-1-user-registration-with-sms-otp (2026-06-07)

- In-memory OTP lost on server restart [otp-service.js:3] — Known architectural decision; Redis persistence planned for future.
- JWT in localStorage exposes token to XSS [AuthContext.jsx] — Inherent tradeoff of localStorage auth; accepted for v1.
- No login endpoint — Part of Story 2.2 (planned).
- No token refresh mechanism — Future auth work (planned).
- No server-side auth middleware — Coming in future stories.

## Deferred from: code review of 2-2-login-with-unified-phone-email-field (2026-06-07)

- OTP bypass — no verified flag check on login — pre-existing (no verified field in schema)
- Rate limiter IP-only, vulnerable to distributed credential stuffing — pre-existing pattern across all endpoints
- `isFirstLogin` should use dedicated `profile_completed` flag — schema change needed
- Phone PII in JWT payload — pre-existing pattern from Story 2.1
- No refresh-token rotation — enhancement beyond scope
- No JWT server-side verify middleware — pre-existing architectural gap
- JWT payload missing access/status for revocation — requires auth middleware
- `isAuthenticated = !!token` doesn't check token expiry — pre-existing pattern
