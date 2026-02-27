const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initializeDatabase = async () => {
  try {
    // With Prisma, schema is managed via \`prisma generate\` and \`prisma db push\` 
    // or \`prisma migrate\`. This function can just verify DB connectivity.
    await prisma.$connect();
    console.log('Database connected successfully via Prisma');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, initializeDatabase };
