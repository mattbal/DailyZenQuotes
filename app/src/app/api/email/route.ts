import crypto from 'node:crypto';
import prisma from '@/app/lib/prisma';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { token, email } = await req.json();
  const validEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );

  if (!validEmail) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
    });
  }

  const hcaptcha_res = await fetch('https://api.hcaptcha.com/siteverify/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`,
  });

  if (hcaptcha_res.status !== 200) {
    return new Response(JSON.stringify({ error: 'Invalid captcha' }), {
      status: 400,
    });
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
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ data: email }));
}

export async function DELETE(req: NextRequest) {
  let encryptedEmail = req.nextUrl.pathname;

  const key = Buffer.from(process.env.SECRET_KEY!, 'base64');
  const ivCipherText = Buffer.from(encryptedEmail, 'base64url');
  const iv = ivCipherText.subarray(0, 16);
  const ciphertext = ivCipherText.subarray(16);
  let cipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
  let email = decrypted.toString('utf-8');

  try {
    await prisma.email.delete({
      where: {
        email,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }
}
