'use client';

import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/toast-context';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    showToast('You\'re in. Welcome to the crew.', 'success');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section className="bg-neutral-900 dark:bg-black">
      <div className="container mx-auto py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left: bold headline */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3 font-display">
              Newsletter
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black uppercase leading-[0.9] text-white">
              Stay<br />Ahead.
            </h2>
            <p className="mt-4 text-neutral-400 text-sm max-w-sm leading-relaxed">
              New drops, exclusive deals, and style tips — straight to your inbox. No spam.
            </p>
          </div>

          {/* Right: form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className={cn(
                'h-12 px-4 bg-transparent border-b-2 border-neutral-700',
                'text-white text-sm placeholder:text-neutral-500',
                'outline-none focus:border-accent transition-colors',
              )}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'h-12 bg-accent text-white text-xs font-bold uppercase tracking-widest font-display',
                'hover:bg-white hover:text-black transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {isSubmitting ? 'Joining...' : 'Join The List'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
