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

  // Locations: Fetch One
  app.get('/api/locations/:id', async (req, res) => {
    try {
      const location = await prisma.location.findUnique({
        where: { id: req.params.id },
        include: { owner: { select: { displayName: true } } }
      });
      if (location) res.json(location);
      else res.status(404).json({ error: 'Location not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch location' });
    }
  });

  // Equipment API
  app.get('/api/equipment', async (req, res) => {
    try {
      const equipment = await prisma.equipment.findMany({
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
    } catch (e) {
      console.warn('Seed failed, user might already exist with different ID');
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
