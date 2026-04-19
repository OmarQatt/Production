import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './src/lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Auth: Register
  app.post('/api/register', async (req, res) => {
    const { email, displayName, role } = req.body;
    try {
      const user = await prisma.user.create({
        data: { email, displayName, role: role.toUpperCase() }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Registration failed. Email might already exist.' });
    }
  });

  // Auth: Login (Simple mock login for now)
  app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) res.json(user);
      else res.status(404).json({ error: 'User not found' });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Users: Fetch Profile
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          listings: true,
          bookings: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      if (user) res.json(user);
      else res.status(404).json({ error: 'User not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Locations: Create
  app.post('/api/locations', async (req, res) => {
    const { ownerId, name, description, type, city, address, pricePerDay, photos } = req.body;
    try {
      const location = await prisma.location.create({
        data: {
          ownerId, name, description, type, city, address, 
          pricePerDay: parseInt(pricePerDay),
          photos: JSON.stringify(photos || []),
          status: 'PENDING'
        }
      });
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create location' });
    }
  });

  // Bookings: Create Request
  app.post('/api/bookings', async (req, res) => {
    const { clientId, serviceId, serviceType, startDate, endDate, totalPrice } = req.body;
    try {
      const booking = await prisma.booking.create({
        data: {
          clientId, serviceId, serviceType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalPrice: parseInt(totalPrice),
          status: 'PENDING'
        }
      });
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // Bookings: Fetch All
  app.get('/api/bookings', async (req, res) => {
    try {
      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // Locations: Fetch All (Active)
  app.get('/api/locations', async (req, res) => {
    try {
      const locations = await prisma.location.findMany({
        include: { owner: { select: { displayName: true } } }
      });
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  // Unified Service Detail API
  app.get('/api/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // Try Location
      const location = await prisma.location.findUnique({
        where: { id },
        include: { 
          owner: { select: { displayName: true } },
          reviews: { orderBy: { createdAt: 'desc' } }
        }
      });
      if (location) return res.json({ ...location, serviceType: 'LOCATION' });

      // Try Equipment
      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: { 
          company: { select: { displayName: true } },
          reviews: { orderBy: { createdAt: 'desc' } }
        }
      });
      if (equipment) return res.json({ ...equipment, serviceType: 'EQUIPMENT', owner: equipment.company });

      // Try Talent
      const talent = await prisma.talent.findUnique({
        where: { id },
        include: { 
          user: { select: { displayName: true, photoURL: true } },
          reviews: { orderBy: { createdAt: 'desc' } }
        }
      });
      if (talent) return res.json({ 
        ...talent, 
        serviceType: 'TALENT', 
        name: talent.user.displayName,
        owner: { displayName: 'Independent Artist' },
        photos: JSON.stringify([talent.user.photoURL].filter(Boolean)) 
      });

      res.status(404).json({ error: 'Service not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch service detail' });
    }
  });

  // Equipment API
  app.get('/api/equipment', async (req, res) => {
    const { search, type, status, minPrice, maxPrice } = req.query;
    try {
      const equipment = await prisma.equipment.findMany({
        where: {
          AND: [
            search ? {
              OR: [
                { name: { contains: search as string } },
                { description: { contains: search as string } }
              ]
            } : {},
            type ? { type: type as string } : {},
            status ? { status: status as string } : {},
            minPrice ? { pricePerDay: { gte: parseInt(minPrice as string) } } : {},
            maxPrice ? { pricePerDay: { lte: parseInt(maxPrice as string) } } : {},
          ]
        },
        include: { company: { select: { displayName: true } } }
      });
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch equipment' });
    }
  });

  // Talent Search API
  app.get('/api/talent', async (req, res) => {
    const { type, gender, minAge, maxAge } = req.query;
    try {
      const talent = await prisma.talent.findMany({
        where: {
          type: type as string || undefined,
          gender: gender as string || undefined,
          age: {
            gte: minAge ? parseInt(minAge as string) : undefined,
            lte: maxAge ? parseInt(maxAge as string) : undefined,
          }
        },
        include: { user: { select: { displayName: true, photoURL: true } } }
      });
      res.json(talent);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search talent' });
    }
  });

  // Reviews: Create
  app.post('/api/reviews', async (req, res) => {
    const { targetId, authorId, authorName, rating, comment } = req.body;
    try {
      const review = await prisma.review.create({
        data: {
          targetId, authorId, authorName,
          rating: parseInt(rating),
          comment
        }
      });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // Favorites: Toggle
  app.post('/api/favorites/toggle', async (req, res) => {
    const { userId, targetId, targetType } = req.body;
    try {
      const existing = await prisma.favorite.findUnique({
        where: { userId_targetId: { userId, targetId } }
      });

      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return res.json({ favorited: false });
      } else {
        await prisma.favorite.create({
          data: { userId, targetId, targetType }
        });
        return res.json({ favorited: true });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  });

  // Favorites: Status
  app.get('/api/favorites/status', async (req, res) => {
    const { userId, targetId } = req.query;
    try {
      const existing = await prisma.favorite.findUnique({
        where: { userId_targetId: { userId: userId as string, targetId: targetId as string } }
      });
      res.json({ favorited: !!existing });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check favorite status' });
    }
  });

  // Services: Related Items
  app.get('/api/services/:id/related', async (req, res) => {
    const { id } = req.params;
    const { type, serviceType } = req.query;
    try {
      let items: any[] = [];
      if (serviceType === 'LOCATION') {
        items = await prisma.location.findMany({
          where: { 
            type: type as string,
            id: { not: id }
          },
          take: 8
        });
      } else if (serviceType === 'EQUIPMENT') {
        items = await prisma.equipment.findMany({
          where: { 
            type: type as string,
            id: { not: id }
          },
          take: 8
        });
      }
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch related items' });
    }
  });

  // Negotiations: Send Message
  app.post('/api/negotiate', async (req, res) => {
    const { senderId, receiverId, targetId, content, priceOffer } = req.body;
    try {
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId: receiverId || 'admin-1', // Default to admin for now if no owner
          targetId,
          content,
          priceOffer: priceOffer ? parseInt(priceOffer.toString()) : null
        }
      });
      res.json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Seed a mock user so the system has an owner for listings
    try {
      await prisma.user.upsert({
        where: { email: 'admin@cinepro.com' },
        update: {},
        create: {
          id: 'admin-1',
          email: 'admin@cinepro.com',
          displayName: 'CinePro Admin',
          role: 'ADMIN'
        }
      });
      console.log('Mock Admin User Seeded');

      // Seed some initial equipment
      const equipmentCount = await prisma.equipment.count();
      if (equipmentCount === 0) {
        await prisma.equipment.createMany({
          data: [
            {
              id: 'eq-1',
              companyId: 'admin-1',
              name: 'ARRI Alexa Mini LF Cinema Package',
              description: 'Large format cinema camera with complete cage, baseplate, and 1TB media.',
              type: 'CAMERA',
              pricePerDay: 850,
              photos: JSON.stringify(['https://picsum.photos/seed/alexa/800/600']),
              status: 'AVAILABLE'
            },
            {
              id: 'eq-2',
              companyId: 'admin-1',
              name: 'Aputure 600d Pro Light Kit',
              description: 'High-output daylight balanced LED light with F10 Fresnel and barn doors.',
              type: 'LIGHTING',
              pricePerDay: 120,
              photos: JSON.stringify(['https://picsum.photos/seed/light/800/600']),
              status: 'AVAILABLE'
            },
            {
              id: 'eq-3',
              companyId: 'admin-1',
              name: 'Sennheiser MKH 416 Boom Kit',
              description: 'Industry standard shotgun microphone with blimp and Carbon Fiber pole.',
              type: 'AUDIO',
              pricePerDay: 45,
              photos: JSON.stringify(['https://picsum.photos/seed/audio/800/600']),
              status: 'AVAILABLE'
            }
          ]
        });
        console.log('Equipment seeded');
      }

      // Seed some initial talent
      const talentCount = await prisma.talent.count();
      if (talentCount === 0) {
        // Create a talent user
        const talentUser = await prisma.user.upsert({
          where: { email: 'talent@cinepro.com' },
          update: {},
          create: {
            id: 'talent-1',
            email: 'talent@cinepro.com',
            displayName: 'Alexandra V.',
            role: 'FREELANCER',
            photoURL: 'https://picsum.photos/seed/model1/600/800'
          }
        });

        await prisma.talent.create({
          data: {
            id: 'talent-id-1',
            userId: talentUser.id,
            type: 'MODEL',
            experience: '5+ Years',
            gender: 'Female',
            age: 24,
            height: 175,
            weight: 58,
            skinTone: 'Fair',
            city: 'Milan',
            positions: JSON.stringify(['Fashion', 'Commercial'])
          }
        });
        console.log('Talent seeded');
      }
    } catch (e) {
      console.warn('Seed failed, user might already exist with different ID');
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
