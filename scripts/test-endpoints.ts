import { adminApi, userApi, publicApi, backendApi } from '../lib/api-backend';
import chalk from 'chalk';
import ora from 'ora';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  duration: number;
  error?: string;
}

const TEST_EMAIL = 'gaudia@bqitech.com';
const TEST_PASSWORD = '@Locamade12182';
const API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:10000';

let authToken: string;
let refreshToken: string;

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  requestFn: () => Promise<any>
): Promise<TestResult> {
  const spinner = ora(`Testing ${method} ${endpoint}`).start();
  const startTime = Date.now();

  try {
    const result = await requestFn();
    console.log(`Request to ${endpoint}:`, result);
    spinner.succeed(`${method} ${endpoint} - ${Date.now() - startTime}ms`);
    return {
      endpoint,
      method,
      status: 'success',
      duration: Date.now() - startTime
    };
  } catch (error) {
    console.log('API request error:', error);
    
    // Try to refresh token if unauthorized
    if (error.message.includes('401') && refreshToken) {
      spinner.text = `Attempt 1: Refreshing token for ${endpoint}`;
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (response.ok) {
          const data = await response.json();
          authToken = data.access_token;
          refreshToken = data.refresh_token;
          backendApi.setAuthToken(authToken, refreshToken);

          // Retry the request
          spinner.text = `Attempt 2: Retrying ${endpoint} with new token`;
          const retryResult = await requestFn();
          console.log(`Retry request to ${endpoint}:`, retryResult);
          spinner.succeed(`${method} ${endpoint} - ${Date.now() - startTime}ms`);
          return {
            endpoint,
            method,
            status: 'success',
            duration: Date.now() - startTime
          };
        }
      } catch (refreshError) {
        console.log('Token refresh error:', refreshError);
      }
    }

    spinner.fail(`${method} ${endpoint} - ${error.message}`);
    return {
      endpoint,
      method,
      status: 'error',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

async function runTests() {
  const results: TestResult[] = [];

  // Test public endpoints
  console.log(chalk.yellow('\nTesting Public Endpoints:'));
  results.push(await testEndpoint('/health', 'GET', () => fetch(`${API_URL}/health`).then(res => res.json())));
  results.push(await testEndpoint('/api/blog-posts', 'GET', () => fetch(`${API_URL}/api/blog-posts`).then(res => res.json())));
  results.push(await testEndpoint('/api/contact', 'POST', () => fetch(`${API_URL}/api/contact`).then(res => res.json())));

  // Test authentication
  console.log(chalk.yellow('\nTesting Authentication:'));
  try {
    const authResult = await testEndpoint('/api/auth/login', 'POST', async () => {
      const formData = new URLSearchParams({
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`Auth failed: ${error.detail || response.status}`);
      }
      
      const data = await response.json();
      authToken = data.access_token;
      refreshToken = data.refresh_token;
      
      // Set the token for subsequent requests
      if (authToken) {
        backendApi.setAuthToken(authToken, refreshToken);
      }
      
      return data;
    });
    results.push(authResult);
  } catch (error) {
    console.log(chalk.red('\nAuthentication failed:', error.message));
    console.log(chalk.red('Skipping authenticated endpoints.'));
    return summarizeResults(results);
  }

  // Test user endpoints
  console.log(chalk.yellow('\nTesting User Endpoints:'));
  results.push(await testEndpoint('/api/users/profile', 'GET', () => userApi.getProfile()));
  results.push(await testEndpoint('/api/users/settings', 'GET', () => userApi.getSettings()));
  results.push(await testEndpoint('/api/users/application-stats', 'GET', () => userApi.getApplicationStats()));
  results.push(await testEndpoint('/api/users/latest-application', 'GET', () => userApi.getLatestApplication()));
  results.push(await testEndpoint('/api/users/hiring-progress', 'GET', () => backendApi.get('/api/users/hiring-progress')));

  // Test admin endpoints
  console.log(chalk.yellow('\nTesting Admin Endpoints:'));
  results.push(await testEndpoint('/api/admin/overview', 'GET', () => adminApi.getOverview()));
  results.push(await testEndpoint('/api/admin/applications', 'GET', () => adminApi.getApplications()));
  results.push(await testEndpoint('/api/admin/job-postings', 'GET', () => adminApi.getJobPostings()));
  results.push(await testEndpoint('/api/admin/users', 'GET', () => adminApi.getUsers()));
  results.push(await testEndpoint('/api/admin/settings', 'GET', () => adminApi.getSettings()));

  // Test job endpoints
  console.log(chalk.yellow('\nTesting Job Endpoints:'));
  results.push(await testEndpoint('/api/jobs', 'GET', () => backendApi.get('/api/jobs')));
  results.push(await testEndpoint('/api/applications', 'GET', () => backendApi.get('/api/applications')));

  return summarizeResults(results);
}

function summarizeResults(results: TestResult[]) {
  console.log('\nTest Summary:');
  const total = results.length;
  const successful = results.filter(r => r.status === 'success').length;
  const failed = total - successful;
  const avgTime = Math.round(results.reduce((acc, r) => acc + r.duration, 0) / total);

  console.log(`Total Endpoints Tested: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Average Response Time: ${avgTime}ms\n`);

  if (failed > 0) {
    console.log('Failed Endpoints:');
    results
      .filter(r => r.status === 'error')
      .forEach(r => console.log(`${r.method} ${r.endpoint}: ${r.error}`));
  }
}

runTests(); 