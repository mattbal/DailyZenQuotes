import crypto from 'node:crypto';
import prisma from '@/app/lib/db';
import { createEmailSchema } from '@/app/schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
    });
  }
  const result = createEmailSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Invalid data' }), {
      status: 400,
    });
  }

  const email = result.data.email;
  const token = result.data.token;

  const hcaptcha_res = await fetch('https://api.hcaptcha.com/siteverify/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
  });

  if (hcaptcha_res.status !== 200) {
    return Response.json(
      { error: 'Invalid captcha' },
      {
        status: 400,
      }
    );
  }

  const key = Buffer.from(process.env.SECRET_KEY!, 'base64');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = Buffer.concat([iv, cipher.update(email, 'utf8'), cipher.final()]);

  let encryptedEmail = encrypted.toString('base64url');

  try {
    await prisma.email.create({
      data: {
        email,
        encryptedEmail,
      },
    });
  } catch (error) {
    return Response.json(
      { error },
      {
        status: 500,
      }
    );
  }

  return Response.json(
    {},
    {
      status: 200,
    }
  );
}
