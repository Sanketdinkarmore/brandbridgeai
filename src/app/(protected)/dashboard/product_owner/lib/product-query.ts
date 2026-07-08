import type { QueryFilter } from "mongoose";
import type { IProductOwnerProduct } from "../_models/ProductOwnerProduct";
import type { ProductSearchFilters } from "./types";

export function buildProductFilter(
  userId: string,
  filters: ProductSearchFilters,
): QueryFilter<IProductOwnerProduct> {
  const query: QueryFilter<IProductOwnerProduct> = { userId };

  if (filters.q?.trim()) {
    const term = filters.q.trim();
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
      { tags: { $regex: term, $options: "i" } },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.tags) {
    const tagList = filters.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tagList.length) {
      query.tags = { $all: tagList };
    }
  }

  const minBudget = filters.minBudget ? Number(filters.minBudget) : undefined;
  const maxBudget = filters.maxBudget ? Number(filters.maxBudget) : undefined;

  if (minBudget !== undefined || maxBudget !== undefined) {
    query.marketingBudget = {};
    if (minBudget !== undefined && !Number.isNaN(minBudget)) {
      query.marketingBudget.$gte = minBudget;
    }
    if (maxBudget !== undefined && !Number.isNaN(maxBudget)) {
      query.marketingBudget.$lte = maxBudget;
    }
  }

  return query;
}
