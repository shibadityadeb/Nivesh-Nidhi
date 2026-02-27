const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initializeDatabase = async () => {
  try {

    await prisma.$connect();
    console.log('Database Connected Successfully!!!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, initializeDatabase };
