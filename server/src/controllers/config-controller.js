import prisma from '../../config/prisma-client.js';

export async function getConfig(req, res, next) {
  try {
    const user = req.user;
    let configData = {
      whatsapp_avisos_url: '',
      whatsapp_abierto_url: '',
      tablon_title: '',
      tablon_subtitle: '',
      tablon_body: '',
      tablon_footer: '',
      tablon_show_schedules: 'false',
      tablon_schedules_title: '',
      tablon_schedules_body: ''
    };

    const keysToFetch = [
      'whatsapp_avisos_url', 
      'whatsapp_abierto_url',
      'tablon_title',
      'tablon_subtitle',
      'tablon_body',
      'tablon_footer',
      'tablon_show_schedules',
      'tablon_schedules_title',
      'tablon_schedules_body'
    ];
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      keysToFetch.push('twilio_account_sid', 'twilio_auth_token', 'twilio_phone_number', 'admin_phone');
    }

    const dbUser = user ? await prisma.user.findUnique({ where: { id: user.id } }) : null;

    if (dbUser && (dbUser.status === 'Alta' || dbUser.role === 'admin' || dbUser.role === 'superadmin')) {
      const configs = await prisma.appConfig.findMany({
        where: {
          key: { in: keysToFetch }
        }
      });
      
      keysToFetch.forEach(key => {
        let val = configs.find(c => c.key === key)?.value || '';
        // Security Masking: never return raw auth token
        if (key === 'twilio_auth_token' && val) {
          val = '••••••••';
        }
        configData[key] = val;
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
      'admin_phone',
      'tablon_title',
      'tablon_subtitle',
      'tablon_body',
      'tablon_footer',
      'tablon_show_schedules',
      'tablon_schedules_title',
      'tablon_schedules_body'
    ];
    
    const itemsToUpsert = [];
    
    for (const field of fieldsToUpdate) {
      if (req.body[field] !== undefined) {
        // If it's the masked token, don't overwrite it
        if (field === 'twilio_auth_token' && req.body[field] === '••••••••') {
          continue;
        }
        itemsToUpsert.push({ 
          key: field, 
          value: typeof req.body[field] === 'string' ? req.body[field].trim() : '' 
        });
      }
    }

    for (const item of itemsToUpsert) {
      // Upsert always to prevent Ghost Config from env fallback
      await prisma.appConfig.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value }
      });
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
