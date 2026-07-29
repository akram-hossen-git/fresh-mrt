import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="font-display text-[8rem] md:text-[12rem] font-bold leading-none text-neutral-900 dark:text-white">
        404
      </h1>

      <h2 className="mt-4 text-xl md:text-2xl font-medium text-neutral-900 dark:text-white">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-neutral-500 dark:text-neutral-400 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-8 inline-block px-8 py-3.5 text-sm font-medium tracking-wider uppercase bg-black text-white dark:bg-white dark:text-black hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors duration-300"
      >
        Back to Home
      </Link>
    </div>
  );
}
