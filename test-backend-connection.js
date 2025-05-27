#!/usr/bin/env node
/**
 * Simple Node.js script to test the backend connection from frontend directory
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBackendConnection() {
  console.log('🔗 Testing Backend Connection...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/health');
    const data = await response.json();
    console.log('✅ Health Check:', data.message);
    console.log('📅 Timestamp:', data.timestamp);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return;
  }

  // Test 2: API Documentation
  console.log('\n2️⃣ Testing API Documentation...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/openapi.json');
    const data = await response.json();
    console.log('✅ API Docs Available:', data.info.title);
    console.log('📖 Version:', data.info.version);
  } catch (error) {
    console.log('❌ API Docs Failed:', error.message);
  }

  // Test 3: Login
  console.log('\n3️⃣ Testing Login Endpoint...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@lyo.ai',
        password: 'admin123'
      }),
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Login Success:', data.user.name);
      console.log('🔑 Token received:', data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Login Failed:', data.detail);
    }
  } catch (error) {
    console.log('❌ Login Error:', error.message);
  }

  // Test 4: Test endpoint
  console.log('\n4️⃣ Testing Generic Test Endpoint...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/test');
    const data = await response.json();
    console.log('✅ Test Endpoint:', data.message);
    console.log('📋 Instructions:', data.frontend_instructions.note);
  } catch (error) {
    console.log('❌ Test Endpoint Failed:', error.message);
  }

  console.log('\n🎉 Backend Connection Test Complete!');
  console.log('📱 Frontend can now connect to: http://localhost:8000');
  console.log('📚 API Documentation: http://localhost:8000/api/v1/docs');
}

testBackendConnection().catch(console.error);
