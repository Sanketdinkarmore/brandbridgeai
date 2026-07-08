"use client";

import Link from "next/link";
import { Eye, Handshake, Pencil, Trash2, ArrowRight } from "lucide-react";
import ProductStatusBadge from "./ProductStatusBadge";
import type { ProductOwnerProductItem } from "../lib/types";

interface ProductOwnerProductCardProps {
  product: ProductOwnerProductItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductOwnerProductCard({
  product,
  onEdit,
  onDelete,
}: ProductOwnerProductCardProps) {
  const cover = product.images?.[0];

  return (
    <div className="bb-glass bb-card flex flex-col overflow-hidden rounded-2xl">
      <Link href={`/dashboard/product_owner/products/${product._id}`} className="block">
        <div className="relative aspect-video bg-white/5">
          {cover ? (
            <img src={cover} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/20">No image</div>
          )}
          {product.images && product.images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/80">
              +{product.images.length - 1} more
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/dashboard/product_owner/products/${product._id}`}
              className="bb-display font-medium hover:text-purple-200"
            >
              {product.name}
            </Link>
            {product.category && (
              <p className="mt-0.5 text-xs text-purple-300">{product.category}</p>
            )}
          </div>
          <ProductStatusBadge status={product.status} />
        </div>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs text-white/45">{product.description}</p>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-white/45">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {product.analytics?.views ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Handshake size={12} /> {product.analytics?.collaborationRequests ?? 0}
          </span>
          {product.marketingBudget != null && (
            <span>Budget: ${product.marketingBudget.toLocaleString()}</span>
          )}
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={`/dashboard/product_owner/products/${product._id}`}
            className="bb-btn-primary flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs"
          >
            View Details <ArrowRight size={12} />
          </Link>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/5"
              aria-label="Edit product"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-white/10 p-2 text-red-400/70 hover:bg-white/5"
              aria-label="Delete product"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
