import { StravaClient } from '@/lib/external/strava';
import { prisma } from '@/lib/prisma';

async function testStravaIntegration() {
  try {
    // Get a test user
    const user = await prisma.user.findFirst({
      where: {
        accounts: {
          some: {
            provider: 'strava'
          }
        }
      }
    });

    if (!user) {
      console.error('No user with Strava account found');
      return;
    }

    console.log('Testing with user:', user.email);

    // Initialize Strava client
    const strava = new StravaClient(user.id);

    // Test athlete info
    console.log('\nTesting athlete info...');
    const athlete = await strava.getAthlete();
    console.log('Athlete:', {
      id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname
    });

    // Test activities
    console.log('\nTesting activity fetch...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await strava.getActivities(thirtyDaysAgo);
    console.log('Found activities:', activities.length);
    console.log('Sample activity:', activities[0]);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStravaIntegration().catch(console.error); 