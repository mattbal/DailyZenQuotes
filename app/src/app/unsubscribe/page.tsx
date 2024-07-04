'use client';
import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function Unsubscribe() {
  const [status, setStatus] = useState('idle'); // idle | submitting | error | submitted
  const [error, setError] = useState('');

  const searchParams = useSearchParams();
  const encryptedEmail = searchParams.get('qs');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (encryptedEmail === '' || encryptedEmail === null) return;

    setStatus('submitting');

    const res = await fetch(`/api/email/${encryptedEmail}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus('error');
      if (json.error) {
        setError(json.error);
      }
    } else {
      setStatus('submitted');
    }
  }

  return (
    <div className='px-4 max-w-md mx-auto'>
      <main>
        <p className='text-gray-600 mt-32 text-sm xs:text-base mb-3'>
          Unsubscribe from all emails
        </p>
        {status === 'error' && <p className='text-red-700 mb-2'>Error. {error}</p>}
        {status === 'submitted' && (
          <p className='text-gray-700 mb-2'>Successfully unsubscribed</p>
        )}
        {status !== 'submitted' && (
          <form onSubmit={handleSubmit}>
            <button
              type='submit'
              className='bg-gray-900 text-white px-3 h-full self-center focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md py-2 w-fit'
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting...' : 'Unsubscribe'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Unsubscribe />
    </Suspense>
  );
}
