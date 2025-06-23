const fetch = require('node-fetch');

async function testSignup() {
    const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';

    // Test cases
    const testCases = [{
            name: "New User Registration",
            email: `test${Date.now()}@example.com`,
            password: "Test123!@#",
            name: "Test User",
            expectSuccess: true
        },
        {
            name: "Duplicate Email (same case)",
            email: "test@example.com",
            password: "Test123!@#",
            name: "Test User 2",
            expectSuccess: false
        },
        {
            name: "Duplicate Email (different case)",
            email: "TEST@example.com",
            password: "Test123!@#",
            name: "Test User 3",
            expectSuccess: false
        }
    ];

    for (const testCase of testCases) {
        console.log(`\nRunning test: ${testCase.name}`);
        try {
            // Create form data
            const formData = new URLSearchParams();
            formData.append('email', testCase.email);
            formData.append('password', testCase.password);
            formData.append('name', testCase.name);

            const response = await fetch(`${baseUrl}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (testCase.expectSuccess) {
                if (response.ok) {
                    console.log('✅ Success:', data.message);
                } else {
                    console.log('❌ Failed:', data.detail);
                }
            } else {
                if (!response.ok && data.detail === "Email already registered") {
                    console.log('✅ Correctly rejected duplicate email');
                } else {
                    console.log('❌ Should have rejected duplicate email');
                }
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

testSignup().catch(console.error);