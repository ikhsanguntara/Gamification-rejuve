'use strict';

const axios = require('axios');

/**
 * Helper untuk menembak webhook ke API Lynx
 * @param {string} endpoint - Endpoint Lynx (misal: '/gamification/webhook/departments')
 * @param {Object|Array} payload - Data JSON yang dikirim
 * @param {string} method - 'POST', 'PUT', atau 'DELETE'
 */
const pushToLynx = async (endpoint, payload, method = 'POST') => {
  const lynxBaseUrl = process.env.LYNX_API_URL;
  const lynxToken = process.env.LYNX_API_TOKEN;

  // Jika URL tidak di-set (misal di local dev belum siap), skip saja agar tidak error
  if (!lynxBaseUrl) {
    console.log(`[Webhook Skip] LYNX_API_URL tidak diset. Data dikirim:`, payload);
    return false;
  }

  try {
    const url = `${lynxBaseUrl}${endpoint}`;
    console.log(`[Webhook Push] Menembak ${method} ke Lynx -> ${url}`);

    const response = await axios({
      method,
      url,
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lynxToken}`
      },
      timeout: 15000 // timeout dinaikkan ke 15 detik untuk local dev
    });

    console.log(`[Webhook Success] Respons Lynx:`, response.data);
    return true;
  } catch (error) {
    console.error(`[Webhook Failed] Gagal menembak Lynx di ${endpoint}:`, error.message);
    // Kita tidak melempar (throw) error ini agar proses CRUD Gamification tetap sukses di DB lokal
    return false;
  }
};

module.exports = {
  pushToLynx
};
