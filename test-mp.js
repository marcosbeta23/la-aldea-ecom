const https = require('https');

const accessToken = 'APP_USR-7323296378728809-011616-38fa5c7c42e15d2b1e08cb2c61fd9c07-3139064037';

// 🔧 Preferencia SIN auto_return (para testear primero)
const preference = {
  items: [
    {
      title: 'Bomba de Agua 1HP (Prueba)',
      quantity: 1,
      unit_price: 100,
      currency_id: 'UYU'
    }
  ],
  payer: {
    email: 'test_user_123456@testuser.com'
  },
  back_urls: {
    success: 'http://localhost:3000/gracias',
    failure: 'http://localhost:3000/error',
    pending: 'http://localhost:3000/pendiente'
  },
  // ❌ COMENTADO por ahora
  // auto_return: 'approved',
  external_reference: 'TEST-ORDER-001'
};

const data = JSON.stringify(preference);

const options = {
  hostname: 'api.mercadopago.com',
  port: 443,
  path: '/checkout/preferences',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'Content-Length': data.length
  }
};

console.log('📤 Enviando preferencia a MercadoPago...\n');

const req = https.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Respuesta exitosa de MercadoPago:\n');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.sandbox_init_point) {
          console.log('\n🎯 URL para probar el checkout:');
          console.log('\x1b[36m%s\x1b[0m', response.sandbox_init_point);
          console.log('\n📋 Copiá y pegá esa URL en tu navegador para probar el pago.');
        }
      } else {
        console.log('❌ Error de MercadoPago:\n');
        console.log(JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error('❌ Error parseando respuesta:', error);
      console.log('Respuesta raw:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error);
});

req.write(data);
req.end();