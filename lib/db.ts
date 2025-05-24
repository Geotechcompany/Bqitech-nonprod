// lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStatuses = async () => {
  return await prisma.application.findMany({
    select: {
      status: true,
    },
    distinct: ['status'],
  });
};

export default prisma;