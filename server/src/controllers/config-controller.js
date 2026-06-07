import prisma from '../../config/prisma-client.js';

export async function getWhatsAppLinks(req, res, next) {
  try {
    const configs = await prisma.appConfig.findMany({
      where: {
        key: { in: ['whatsapp_avisos_url', 'whatsapp_abierto_url'] }
      }
    });

    const links = {
      whatsapp_avisos_url: configs.find(c => c.key === 'whatsapp_avisos_url')?.value || '',
      whatsapp_abierto_url: configs.find(c => c.key === 'whatsapp_abierto_url')?.value || '',
    };

    res.json(links);
  } catch (err) {
    next(err);
  }
}
