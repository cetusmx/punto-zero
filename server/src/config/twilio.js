import { logger } from '../../config/logger.js';
import prisma from '../../config/prisma-client.js';

export async function getTwilioConfig() {
  const configs = await prisma.appConfig.findMany({
    where: {
      key: { in: ['twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'admin_phone'] }
    }
  });

  const getVal = (key, envVar) => {
    const record = configs.find(c => c.key === key);
    return record !== undefined ? record.value : process.env[envVar];
  };

  return {
    accountSid: getVal('twilio_account_sid', 'TWILIO_ACCOUNT_SID'),
    authToken: getVal('twilio_auth_token', 'TWILIO_AUTH_TOKEN'),
    twilioPhone: getVal('twilio_phone_number', 'TWILIO_PHONE_NUMBER'),
    adminPhone: getVal('admin_phone', 'ADMIN_PHONE'),
  };
}

async function getTwilioClient() {
  const config = await getTwilioConfig();

  if (config.accountSid && config.authToken) {
    try {
      const { default: twilio } = await import('twilio');
      const twilioClient = twilio(config.accountSid, config.authToken);
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
  let formattedTo = String(to).trim();
  // If it's exactly 10 digits (standard Mexican format) and doesn't start with +, prepend +52
  if (/^\d{10}$/.test(formattedTo)) {
    formattedTo = '+52' + formattedTo;
  } else if (!formattedTo.startsWith('+') && /^\d+$/.test(formattedTo)) {
    // If it's more than 10 digits but missing +, just prepend +
    formattedTo = '+' + formattedTo;
  }

  const client = await getTwilioClient();
  const config = await getTwilioConfig();
  const fromPhone = config.twilioPhone;

  if (client && fromPhone) {
    try {
      const message = await client.messages.create({
        body,
        to: formattedTo,
        from: fromPhone,
      });
      logger.info(`SMS sent to ${formattedTo}, sid: ${message.sid}`);
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
