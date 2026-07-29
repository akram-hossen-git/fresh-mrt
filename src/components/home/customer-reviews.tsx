import { Star } from 'lucide-react';

const reviews = [
  { name: 'Rafiq A.', rating: 5, text: 'Fit is spot on. Ordered a shirt and it arrived fast — quality is way better than the price suggests.', tag: 'Casual Shirts' },
  { name: 'Tanvir H.', rating: 5, text: 'Been buying here for 6 months. Never had a bad experience. The fabric on the polo collection is 🔥', tag: 'Polo Collection' },
  { name: 'Sabbir M.', rating: 5, text: 'Delivery was quick and packaging was clean. The jeans fit perfectly without any alterations needed.', tag: 'Denim' },
];

export function CustomerReviews() {
  return (
    <section className="bg-neutral-950 py-12 md:py-16">
      <div className="container mx-auto">
        <div className="flex items-stretch gap-4 mb-8">
          <div className="w-1 bg-accent rounded-full" />
          <h2 className="font-display text-2xl md:text-4xl font-black uppercase text-white tracking-tight">
            Real Talk
          </h2>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory md:snap-none">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="shrink-0 snap-start w-[80vw] sm:w-[60vw] md:w-auto bg-neutral-900 p-6 border-t-2 border-accent"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }, (_, j) => (
                  <Star key={j} size={12} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-bold font-display uppercase">{r.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{r.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
