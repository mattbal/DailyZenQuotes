import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter: pool });

export default prisma;
