import { logger } from '../../config/logger.js';

let twilioClient = null;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

async function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (accountSid && authToken) {
    try {
      const { default: twilio } = await import('twilio');
      twilioClient = twilio(accountSid, authToken);
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

  if (client) {
    try {
      const message = await client.messages.create({
        body,
        to,
        from: twilioPhone,
      });
      logger.info(`SMS sent to ${to}, sid: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      logger.error(`Twilio SMS failed for ${to}: ${err.message}`);
      throw new Error('Error al enviar el SMS. Intenta de nuevo.');
    }
  }

  const maskedBody = body.replace(/\d{6}/, '••••••');
  logger.info(`[MOCK SMS] To: ${to}, Body: ${maskedBody}`);
  return { success: true, mock: true };
}
