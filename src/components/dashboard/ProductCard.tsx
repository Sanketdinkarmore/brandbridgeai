"use client";

import { Package, Pencil, Trash2 } from "lucide-react";

interface ProductCardProps {
  name: string;
  description?: string;
  category?: string;
  image?: string;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onMatch?: () => void;
}

export default function ProductCard({
  name,
  description,
  category,
  image,
  status,
  onEdit,
  onDelete,
  onMatch,
}: ProductCardProps) {
  return (
    <div className="bb-glass bb-card rounded-2xl overflow-hidden">
      <div className="aspect-video bg-white/5">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={32} className="text-white/20" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="bb-display font-medium">{name}</h3>
            {category && <p className="mt-0.5 text-xs text-purple-300">{category}</p>}
          </div>
          {status && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] capitalize text-white/50">
              {status}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-2 line-clamp-2 text-xs text-white/45">{description}</p>
        )}
        <div className="mt-4 flex gap-2">
          {onMatch && (
            <button onClick={onMatch} className="bb-btn-primary flex-1 rounded-xl py-2 text-xs">
              Find Brands
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/5">
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="rounded-xl border border-white/10 p-2 text-red-400/70 hover:bg-white/5">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
