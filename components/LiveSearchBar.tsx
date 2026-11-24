'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { Product, formatPrice } from '@/lib/format';

const TRENDING_SEARCHES = [
  'Pashmina',
  'Maroon Stole',
  'Kashmiri Needlework',
  'Bridal Shawl',
  'Swati Weave',
  'Pure Wool',
];

export default function LiveSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced live fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectTrending = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          placeholder="Search Kashmiri pashmina, maroon stole, pure wool..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-full text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 shadow-2xs transition-all"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Trending Searches (when query is empty) */}
          {!query.trim() && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-amber-800" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectTrending(term)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 transition cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim() && (
            <div className="divide-y divide-stone-100">
              {loading && (
                <div className="p-6 text-center text-xs text-stone-400">
                  Searching authentic weaves...
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="p-6 text-center space-y-1">
                  <p className="text-xs font-semibold text-stone-700">No matching shawls found</p>
                  <p className="text-[11px] text-stone-400">
                    Try searching for &quot;wool&quot;, &quot;pashmina&quot;, or &quot;stole&quot;.
                  </p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-stone-50 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                    Matching Shawls &amp; Stoles ({results.length})
                  </div>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setIsOpen(false)}
                      className="p-3 hover:bg-stone-50 flex items-center justify-between gap-3 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-11 h-13 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 block truncate">
                            {product.category_name}
                          </span>
                          <h4 className="text-xs font-serif font-bold text-stone-900 group-hover:text-amber-900 transition truncate">
                            {product.name}
                          </h4>
                          <span className="text-[11px] text-stone-400 line-clamp-1">
                            {product.material || 'Authentic Kashmiri Weave'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-stone-950 font-serif">
                          {formatPrice(product.price)}
                        </div>
                        {product.stock_status === 'in_stock' ? (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Limited
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}

                  <div className="p-2.5 bg-stone-50 text-center border-t border-stone-100">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-xs font-semibold text-amber-900 hover:text-stone-900 inline-flex items-center gap-1.5 transition"
                    >
                      <span>View all search results for &ldquo;{query}&rdquo;</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
