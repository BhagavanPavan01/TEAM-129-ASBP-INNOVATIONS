// Quick test script
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('✅ Backend is working!');
  });
});

req.on('error', (error) => {
  console.error('❌ Backend error:', error.message);
  console.log('Make sure you ran: node server.js');
});

req.end();