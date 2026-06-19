import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(8).max(120)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const auctionSchema = z.object({
  title: z.string().min(4).max(160),
  brand: z.string().min(2).max(80),
  model: z.string().min(1).max(100),
  reference: z.string().max(80).optional(),
  category: z.string().min(2).max(60),
  condition: z.string().min(2).max(80),
  year: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  movement: z.string().max(80).optional(),
  caseMaterial: z.string().max(80).optional(),
  bracelet: z.string().max(80).optional(),
  diameterMm: z.number().positive().optional(),
  description: z.string().min(20).max(4000),
  provenance: z.string().max(1000).optional(),
  estimateLow: z.number().int().positive(),
  estimateHigh: z.number().int().positive(),
  startingBid: z.number().int().positive(),
  reservePrice: z.number().int().positive().optional(),
  endsAt: z.string().datetime(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().min(1), position: z.number().int().default(0) })).min(1)
});

export const bidSchema = z.object({
  amount: z.number().int().positive(),
  maxAmount: z.number().int().positive().optional()
});
