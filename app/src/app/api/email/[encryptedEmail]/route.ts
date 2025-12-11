import crypto from 'node:crypto';
import prisma from '@/app/lib/db';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ encryptedEmail: String }> }
) {
  const { encryptedEmail } = await params;

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
    return Response.json(
      { error },
      {
        status: 500,
      }
    );
  }

  return Response.json({ success: true });
}
