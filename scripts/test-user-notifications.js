// Test script to check user notifications endpoint
const axios = require('axios');

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';

async function testUserNotifications() {
    try {
        console.log('Testing user notifications endpoint...');
        console.log('Backend URL:', BACKEND_URL);

        // Test without authentication first
        console.log('\n1. Testing without authentication:');
        try {
            const response = await axios.get(`${BACKEND_URL}/api/notifications/`);
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            const status = error.response && error.response.status;
            const data = error.response && error.response.data;
            console.log('Error (expected):', status, data);
        }

        // Test with mock authentication
        console.log('\n2. Testing endpoint structure:');
        try {
            const response = await axios.get(`${BACKEND_URL}/api/notifications/`, {
                headers: {
                    'Authorization': 'Bearer dummy-token',
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            const status = error.response && error.response.status;
            const data = error.response && error.response.data;
            console.log('Error:', status, data || error.message);
        }

        // Test the admin endpoint to compare
        console.log('\n3. Testing admin notifications endpoint:');
        try {
            const response = await axios.get(`${BACKEND_URL}/api/admin/notifications`, {
                headers: {
                    'Authorization': 'Bearer dummy-token',
                    'Content-Type': 'application/json',
                },
                timeout: 5000
            });
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            const status = error.response && error.response.status;
            const data = error.response && error.response.data;
            console.log('Error:', status, data || error.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testUserNotifications();