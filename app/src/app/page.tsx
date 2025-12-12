'use client';
import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { statusSchema } from './schemas';

export default function Home() {
  const captchaRef = useRef<HCaptcha>(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | error | submitted
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (token === '') return;

    setStatus('submitting');

    const res = await fetch('/api/email', {
      method: 'POST',
      body: JSON.stringify({
        token,
        email,
      }),
    });

    try {
      const json = await res.json();
      const result = statusSchema.parse(json);
      if (!res.ok) {
        setStatus('error');
        if (result.error) {
          setError(result.error);
        }
      } else {
        setStatus('submitted');
        setEmail('');
      }
    } catch (err) {
      setStatus('error');
      setError('Something went wrong');
    }

    // reset captcha
    setToken('');
    captchaRef.current?.resetCaptcha();
  }

  return (
    <div className='px-4 max-w-md mx-auto'>
      <nav className='mt-32 mb-3 w-fit'>
        <Link href='/'>
          <img src='/zen.svg' alt='Zen' className='w-20 h-20' />
        </Link>
      </nav>
      <header>
        <h1 className='font-bold text-3xl xs:text-4xl text-gray-900 mb-4'>
          Daily Zen Quotes
        </h1>
        <p className='text-gray-600 mb-12 text-sm xs:text-base'>Coming soon.</p>
      </header>
      <main></main>
    </div>
  );
}
