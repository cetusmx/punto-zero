import crypto from 'crypto';

const pendingStore = new Map();

const TTL_MS = 15 * 60 * 1000;

function generateSessionToken() {
  return crypto.randomUUID();
}

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of pendingStore) {
    if (now > entry.expiresAt) {
      pendingStore.delete(token);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

export function createPendingRegistration(data) {
  const token = generateSessionToken();
  pendingStore.set(token, {
    ...data,
    expiresAt: Date.now() + TTL_MS,
  });
  return token;
}

export function consumePendingRegistration(token) {
  const entry = pendingStore.get(token);
  if (!entry) {
    throw Object.assign(new Error('Sesión de registro no válida o expirada.'), { status: 400 });
  }
  if (Date.now() > entry.expiresAt) {
    pendingStore.delete(token);
    throw Object.assign(new Error('Sesión de registro expirada. Regístrate de nuevo.'), { status: 400 });
  }
  pendingStore.delete(token);
  return entry;
}
