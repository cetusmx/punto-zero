import { logger } from '../../config/logger.js';
import prisma from '../../config/prisma-client.js';

let twilioClient = null;
let cachedConfig = null;

export function clearTwilioCache() {
  cachedConfig = null;
  twilioClient = null;
}

export async function getTwilioConfig() {
  if (cachedConfig) return cachedConfig;
  
  const configs = await prisma.appConfig.findMany({
    where: {
      key: { in: ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'admin_phone'] }
    }
  });

  const dbConfig = {
    accountSid: configs.find(c => c.key === 'twilio_account_sid')?.value || process.env.TWILIO_ACCOUNT_SID,
    authToken: configs.find(c => c.key === 'twilio_auth_token')?.value || process.env.TWILIO_AUTH_TOKEN,
    twilioPhone: configs.find(c => c.key === 'twilio_phone_number')?.value || process.env.TWILIO_PHONE_NUMBER,
    adminPhone: configs.find(c => c.key === 'admin_phone')?.value || process.env.ADMIN_PHONE,
  };

  cachedConfig = dbConfig;
  return dbConfig;
}

async function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const config = await getTwilioConfig();

  if (config.accountSid && config.authToken) {
    try {
      const { default: twilio } = await import('twilio');
      twilioClient = twilio(config.accountSid, config.authToken);
      logger.info('Twilio client initialized');
      return twilioClient;
    } catch (err) {
      logger.warn('Failed to initialize Twilio client, using mock fallback: ' + err.message);
    }
  } else {
    logger.info('Twilio credentials not configured, using mock SMS fallback');
  }

  return null;
}

export async function sendSMS(to, body) {
  const client = await getTwilioClient();
  const config = await getTwilioConfig();
  const fromPhone = config.twilioPhone;

  if (client && fromPhone) {
    try {
      const message = await client.messages.create({
        body,
        to,
        from: fromPhone,
      });
      logger.info(`SMS sent to ${to}, sid: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      logger.error(`Twilio SMS failed for ${to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  const maskedBody = body.replace(/\d{6}/, '••••••');
  logger.info(`[MOCK SMS] To: ${to}, Body: ${maskedBody}`);
  return { success: true, mock: true };
}
