import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  // Create an Admin/Partner users
  const partner1 = await prisma.user.create({
    data: {
      email: 'partner1@cinepro.com',
      displayName: 'Silverstream Studios',
      role: 'COMPANY',
    }
  });

  const partner2 = await prisma.user.create({
    data: {
      email: 'partner2@cinepro.com',
      displayName: 'Global Gear Rental',
      role: 'COMPANY',
    }
  });

  // Locations
  await prisma.location.createMany({
    data: [
      {
        ownerId: partner1.id,
        name: 'The Glass Foundry',
        description: 'Industrial loft with floor-to-ceiling windows and exposed brick.',
        type: 'Industrial',
        city: 'London',
        address: '12 Foundry Lane, Shoreditch',
        pricePerDay: 1200,
        amenities: JSON.stringify(['WiFi', 'Parking', 'Power', 'Green Room']),
        status: 'ACTIVE',
        photos: JSON.stringify([])
      },
      {
        ownerId: partner1.id,
        name: 'Brutalist Concrete Hall',
        description: 'Massive concrete space perfect for futuristic sci-fi shoots.',
        type: 'Warehouse',
        city: 'Berlin',
        address: 'Halle 5, Lichtenberg',
        pricePerDay: 2500,
        amenities: JSON.stringify(['Power', 'Heavy Lift', 'Parking']),
        status: 'ACTIVE',
        photos: JSON.stringify([])
      },
    ]
  });

  // Equipment
  await prisma.equipment.createMany({
    data: [
      {
        companyId: partner2.id,
        name: 'Arri Alexa 35 Package',
        description: 'Complete production kit with Master Primes.',
        type: 'CAMERA',
        pricePerDay: 1500,
        status: 'AVAILABLE',
        photos: JSON.stringify([])
      },
      {
        companyId: partner2.id,
        name: 'Aputure 1200d Pro',
        description: 'Powerful daylight LED for large sets.',
        type: 'LIGHTING',
        pricePerDay: 200,
        status: 'RENTED',
        photos: JSON.stringify([])
      }
    ]
  });

  // Talent Users
  const talentUser1 = await prisma.user.create({
    data: {
      email: 'talent1@cinepro.com',
      displayName: 'Alex Rivers',
      role: 'FREELANCER',
    }
  });

  const talentUser2 = await prisma.user.create({
    data: {
      email: 'talent2@cinepro.com',
      displayName: 'Sarah Chen',
      role: 'FREELANCER',
    }
  });

  // Talent Profiles
  await prisma.talent.create({
    data: {
      userId: talentUser1.id,
      type: 'CREW',
      experience: 'PROFESSIONAL',
      gender: 'male',
      age: 32,
      city: 'Paris',
      positions: JSON.stringify(['Lead Photographer', 'Retoucher']),
      status: 'AVAILABLE'
    }
  });

  await prisma.talent.create({
    data: {
      userId: talentUser2.id,
      type: 'MODEL',
      experience: 'INTERMEDIATE',
      gender: 'female',
      age: 24,
      city: 'Milan',
      positions: JSON.stringify(['High Fashion', 'Commercial']),
      status: 'BUSY'
    }
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
