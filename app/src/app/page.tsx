'use client';
import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

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
    const json = await res.json();
    if (!res.ok) {
      setStatus('error');
      if (json.error) {
        setError(json.error);
      }
    } else {
      setStatus('submitted');
      setEmail('');
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
        <p className='text-gray-600 mb-12 text-sm xs:text-base'>
          One Zen quote sent to your email inbox each day.
        </p>
      </header>
      <main>
        {status === 'error' && <p className='text-red-700 mb-2'>Error. {error}</p>}
        {status === 'submitted' && (
          <p className='text-gray-700 mb-2'>Successfully subscribed!</p>
        )}
        {status !== 'submitted' && (
          <form onSubmit={handleSubmit}>
            <div className='rounded-md flex flex-col xs:flex-row mb-6'>
              <input
                type='email'
                required
                className='xs:rounded-l-md xs:rounded-r-none rounded-md placeholder:text-gray-400 border-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 mb-3 xs:mb-0'
                placeholder='youremail@domain.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type='submit'
                className='bg-gray-900 text-white px-3 h-full self-center focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md xs:rounded-l-none xs:rounded-r-md -ml-px py-2 w-full xs:w-fit'
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Submitting...' : 'Subscribe'}
              </button>
            </div>
            <HCaptcha
              sitekey='4b41b0fa-c31d-4470-8c8a-eb5253b5aba4'
              onVerify={(token) => setToken(token)}
              ref={captchaRef}
            />
          </form>
        )}
      </main>
    </div>
  );
}
