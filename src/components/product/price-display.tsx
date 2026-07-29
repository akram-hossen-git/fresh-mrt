import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  mainPrice: string
  strokedPrice: string
  hasDiscount: boolean
  discount: string
  currencySymbol?: string
}

export function PriceDisplay({
  mainPrice,
  strokedPrice,
  hasDiscount,
  discount,
  currencySymbol = '$',
}: PriceDisplayProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-bold text-2xl text-neutral-900 dark:text-white">
        {mainPrice}
      </span>

      {hasDiscount && (
        <>
          <span className="text-lg text-gray-400 line-through dark:text-neutral-500">
            {strokedPrice}
          </span>

          <span
            className={cn(
              'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
              'bg-red-50 text-red-600',
              'dark:bg-red-950 dark:text-red-400'
            )}
          >
            -{discount}
          </span>
        </>
      )}
    </div>
  )
}
