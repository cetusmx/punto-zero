const otpStore = new Map();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createOtp(phone) {
  const now = Date.now();
  const existing = otpStore.get(phone);
  if (existing && now - existing.createdAt < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
    return { ok: false, remaining, code: null };
  }
  const code = generateOtp();
  otpStore.set(phone, {
    code,
    attempts: 0,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
  });
  return { ok: true, code, remaining: 0 };
}

export function verifyOtp(phone, code) {
  const record = otpStore.get(phone);
  if (!record) return { ok: false, reason: 'no_otp' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { ok: false, reason: 'expired' };
  }
  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return { ok: false, reason: 'max_attempts' };
  }
  if (record.code !== code) {
    return { ok: false, reason: 'invalid', attemptsLeft: MAX_ATTEMPTS - record.attempts };
  }
  otpStore.delete(phone);
  return { ok: true };
}

export function clearOtp(phone) {
  otpStore.delete(phone);
}
