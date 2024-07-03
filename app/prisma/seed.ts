import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const prisma = new PrismaClient();

async function main() {
  try {
    const data = fs.readFileSync('../cleaned_data.json', 'utf8');
    const json = JSON.parse(data);
    const quotes = await prisma.quote.createMany({
      data: json,
    });

    await prisma.index.create({
      data: {
        index: 1,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
