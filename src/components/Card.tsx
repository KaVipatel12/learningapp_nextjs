'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';

interface CardProps {
  id: string;
  imageUrl: string;
  title: string;
  instructor: string;
  rating: number;
  totalRatings: number;
  price: number;
  discountedPrice?: number;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
}

export default function Card({
  id,
  imageUrl,
  title,
  instructor,
  rating,
  totalRatings,
  price,
  discountedPrice,
  isWishlisted = false,
  onWishlistToggle,
}: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 group w-full max-w-[240px]">
      {/* Image Container */}
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={() => onWishlistToggle?.(id)}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm ${
            isWishlisted
              ? 'text-red-500 bg-white/90'
              : 'text-gray-600 bg-white/70 hover:bg-white/90'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            fill={isWishlisted ? 'currentColor' : 'none'}
            className="transition-colors duration-200"
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
          <Link href={`/courses/${id}`} className="hover:text-blue-600 transition-colors">
            {title}
          </Link>
        </h3>

        <p className="text-xs text-gray-500 mb-2">By {instructor}</p>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-gray-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">({totalRatings.toLocaleString()})</span>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {discountedPrice ? (
              <>
                <span className="text-sm font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <Link
            href={`/courses/${id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}