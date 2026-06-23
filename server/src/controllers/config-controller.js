import prisma from '../../config/prisma-client.js';
import { clearTwilioCache } from '../config/twilio.js';

export async function getConfig(req, res, next) {
  try {
    const user = req.user;
    let configData = {
      whatsapp_avisos_url: '',
      whatsapp_abierto_url: ''
    };

    const keysToFetch = ['whatsapp_avisos_url', 'whatsapp_abierto_url'];
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      keysToFetch.push('twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'admin_phone');
    }

    if (user && (user.status === 'Alta' || user.role === 'admin' || user.role === 'superadmin')) {
      const configs = await prisma.appConfig.findMany({
        where: {
          key: { in: keysToFetch }
        }
      });
      
      keysToFetch.forEach(key => {
        configData[key] = configs.find(c => c.key === key)?.value || '';
      });
    }

    res.status(200).json({
      data: configData,
      message: 'Success',
      error: null,
      statusCode: 200
    });
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req, res, next) {
  try {
    const fieldsToUpdate = [
      'whatsapp_avisos_url', 
      'whatsapp_abierto_url',
      'twilio_account_sid',
      'twilio_auth_token',
      'twilio_phone_number',
      'admin_phone'
    ];
    
    const itemsToUpsert = [];
    
    for (const field of fieldsToUpdate) {
      if (req.body[field] !== undefined) {
        itemsToUpsert.push({ 
          key: field, 
          value: typeof req.body[field] === 'string' ? req.body[field].trim() : '' 
        });
      }
    }

    let twilioUpdated = false;

    for (const item of itemsToUpsert) {
      if (item.value) {
        await prisma.appConfig.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value }
        });
      } else {
        await prisma.appConfig.deleteMany({
          where: { key: item.key }
        });
      }
      
      if (item.key.startsWith('twilio_') || item.key === 'admin_phone') {
        twilioUpdated = true;
      }
    }

    if (twilioUpdated) {
      clearTwilioCache();
    }

    res.status(200).json({
      data: null,
      message: 'Configuration updated successfully',
      error: null,
      statusCode: 200
    });
  } catch (err) {
    next(err);
  }
}
