import app from './app.js';
import { testConnection } from './db/index.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  const isConnected = await testConnection();
  if (isConnected) {
    console.log('✅ PostgreSQL database connection established.');
  } else {
    console.log('⚠️ Running server without live database connection. Seed script or local Postgres connection will be required for database operations.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 FarmMitra Server running on http://localhost:${PORT}`);
    console.log(`📍 Auth endpoints: http://localhost:${PORT}/api/auth/register | login | me`);
  });
}

startServer();
