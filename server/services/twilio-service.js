import 'dotenv/config';

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (twilioAccountSid && twilioAuthToken) {
  const twilio = await import('twilio');
  twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);
}

export async function sendSms(to, body) {
  if (!twilioClient) {
    console.log(`[SMS MOCK] To: ${to}, Body: ${body}`);
    return { sid: 'mock-sid' };
  }
  const result = await twilioClient.messages.create({
    body,
    from: twilioPhoneNumber,
    to,
  });
  return { sid: result.sid };
}
