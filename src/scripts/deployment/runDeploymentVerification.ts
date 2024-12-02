const { DeploymentVerificationService: VerificationService } = require('../../services/deployment/deploymentVerificationService');
const { analytics } = require('../../services/analytics/analyticsService');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });  // Load .env.local first
require('dotenv').config({ path: '.env' });        // Then load .env

interface VerificationResult {
  category: string;
  passed: boolean;
  details: {
    [key: string]: any;
    timestamp: string;
  };
}

interface DeploymentVerificationReport {
  timestamp: string;
  status: 'PASSED' | 'FAILED';
  results: VerificationResult[];
  recommendations: string[];
}

async function runDeploymentVerification() {
  console.log('🚀 Environment Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current Directory:', __dirname);

  // Add env file check
  const envFiles = ['.env.local', '.env'];
  console.log('\n📝 Checking ENV Files:');
  envFiles.forEach(file => {
    const exists = fs.existsSync(path.resolve(process.cwd(), file));
    console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? 'found' : 'not found'}`);
  });

  console.log('\n🚀 Running Pre-Verification Checks...');

  // Pre-verification environment checks
  const preChecks = {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    requiredFiles: [
      'config/deployment/deploymentConfig.ts',
      'services/analytics/analyticsService.ts',
      'services/deployment/deploymentVerificationService.ts'
    ],
    requiredEnv: {
      database: ['DATABASE_URL'],
      redis: ['UPSTASH_REDIS_URL', 'UPSTASH_REDIS_TOKEN', 'REDIS_ENDPOINT', 'REDIS_PORT'],
      auth: ['NEXTAUTH_URL', 'NEXTAUTH_SECRET'],
      services: [
        'NEXT_PUBLIC_MAPBOX_TOKEN',
        'OPENAI_API_KEY',
        'NEXT_PUBLIC_GOOGLE_MAPS_KEY'
      ],
      aws: [
        'AWS_REGION',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_USER_AVATARS_BUCKET',
        'AWS_USER_CONTENT_BUCKET',
        'AWS_ROUTE_DATA_BUCKET',
        'AWS_ACTIVITY_DATA_BUCKET'
      ]
    }
  };

  // Verify Node version
  const minNodeVersion = 'v14.0.0';
  if (!satisfiesNodeVersion(process.version, minNodeVersion)) {
    console.error(`❌ Node version ${process.version} is below minimum required ${minNodeVersion}`);
    return false;
  }

  // Check environment with more detailed error
  if (!process.env.NODE_ENV || !['staging', 'production'].includes(process.env.NODE_ENV)) {
    console.error(`❌ Environment Check Failed:`);
    console.error(`- Current NODE_ENV: ${process.env.NODE_ENV}`);
    console.error(`- Expected: 'staging' or 'production'`);
    console.error(`- Check your .env and .env.local files`);
    return false;
  }

  // Check required files
  console.log('\n📁 Checking Required Files...');
  for (const file of preChecks.requiredFiles) {
    const filePath = path.resolve(__dirname, '../../', file);
    console.log(`Checking for file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing required file: ${file}`);
      console.error(`   Looking for: ${filePath}`);
      console.error(`   Does file exist? ${fs.existsSync(filePath)}`);
      return false;
    }
    
    try {
      require(filePath);
      console.log(`✅ Found ${file}`);
    } catch (error: any) {
      console.error(`❌ Error requiring ${file}:`, error?.message || 'Unknown error');
      return false;
    }
  }

  // Check required env variables
  console.log('\n🔐 Checking Environment Variables...');
  const missingEnv = Object.entries(preChecks.requiredEnv).reduce((missing, [category, vars]) => {
    const categoryMissing = vars.filter(v => !process.env[v]);
    if (categoryMissing.length > 0) {
      missing[category] = categoryMissing;
    }
    return missing;
  }, {});

  if (Object.keys(missingEnv).length > 0) {
    console.error('❌ Missing environment variables:');
    Object.entries(missingEnv).forEach(([category, vars]) => {
      console.error(`   ${category}: ${vars.join(', ')}`);
    });
    return false;
  }

  // Log pre-verification state
  console.log('\n📊 Pre-Verification State:');
  console.log(JSON.stringify({
    ...preChecks,
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  }, null, 2));

  // Run main verification
  console.log('\n🚀 Starting Deployment Verification...');
  const verificationService = new VerificationService();

  try {
    const report = await verificationService.verifyDeployment();
    
    // Log results
    console.log('\n📋 Verification Report:');
    console.log(`Status: ${report.status}`);
    console.log('\nDetailed Results:');
    
    report.results.forEach((result: VerificationResult) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`\n${icon} ${result.category.toUpperCase()}`);
      console.log('Details:', JSON.stringify(result.details, null, 2));
    });

    if (report.recommendations.length > 0) {
      console.log('\n📝 Recommendations:');
      report.recommendations.forEach((rec: string) => console.log(`- ${rec}`));
    }

    return report.status === 'PASSED';
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Helper function to compare Node versions
function satisfiesNodeVersion(current: string, minimum: string): boolean {
  const parseVersion = (v: string) => v.replace('v', '').split('.').map(Number);
  const [currMajor, currMinor] = parseVersion(current);
  const [minMajor, minMinor] = parseVersion(minimum);
  
  return currMajor > minMajor || (currMajor === minMajor && currMinor >= minMinor);
}

// Run verification with enhanced error handling
runDeploymentVerification()
  .then(passed => {
    if (passed) {
      console.log('\n✨ Deployment verification completed successfully!');
      console.log('Ready to proceed to Security Validation (Day 3-4)');
    } else {
      console.log('\n⚠️ Deployment verification failed. Please address recommendations before proceeding.');
      console.log('\n🔍 Debug Steps:');
      console.log('1. Check the error details above');
      console.log('2. Verify all pre-check conditions');
      console.log('3. Review environment variables');
      console.log('4. Check service connectivity');
    }
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error during verification:', error);
    console.error('\n🔍 Debug Information:');
    console.error('- Timestamp:', new Date().toISOString());
    console.error('- Environment:', process.env.NODE_ENV);
    console.error('- Node Version:', process.version);
    console.error('- Memory Usage:', process.memoryUsage());
    console.error('- Error Stack:', error.stack);
    process.exit(1);
  }); 