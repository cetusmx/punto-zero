import prisma from '../../config/prisma-client.js';

export async function getConfig(req, res, next) {
  try {
    const user = req.user;
    let links = {
      whatsapp_avisos_url: '',
      whatsapp_abierto_url: ''
    };

    if (user && user.status === 'Alta') {
      const configs = await prisma.appConfig.findMany({
        where: {
          key: { in: ['whatsapp_avisos_url', 'whatsapp_abierto_url'] }
        }
      });
      links = {
        whatsapp_avisos_url: configs.find(c => c.key === 'whatsapp_avisos_url')?.value || '',
        whatsapp_abierto_url: configs.find(c => c.key === 'whatsapp_abierto_url')?.value || '',
      };
    } else if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      // Admins should be able to fetch the current config regardless of their 'Alta' status
      const configs = await prisma.appConfig.findMany({
        where: {
          key: { in: ['whatsapp_avisos_url', 'whatsapp_abierto_url'] }
        }
      });
      links = {
        whatsapp_avisos_url: configs.find(c => c.key === 'whatsapp_avisos_url')?.value || '',
        whatsapp_abierto_url: configs.find(c => c.key === 'whatsapp_abierto_url')?.value || '',
      };
    }

    res.status(200).json({
      data: links,
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
    const urlsToUpdate = [];
    
    if (req.body.whatsapp_avisos_url !== undefined) {
      urlsToUpdate.push({ key: 'whatsapp_avisos_url', value: typeof req.body.whatsapp_avisos_url === 'string' ? req.body.whatsapp_avisos_url.trim() : '' });
    }
    
    if (req.body.whatsapp_abierto_url !== undefined) {
      urlsToUpdate.push({ key: 'whatsapp_abierto_url', value: typeof req.body.whatsapp_abierto_url === 'string' ? req.body.whatsapp_abierto_url.trim() : '' });
    }

    for (const item of urlsToUpdate) {
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
