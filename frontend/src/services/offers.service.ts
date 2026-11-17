import type { Offer } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";
import type { PeriodCode } from "../models/offer.ts";

export const getOffers = async (
  token: string,
  period?: PeriodCode,
  title?: string,
  signal?: AbortSignal,
): Promise<Offer[]> => {
  const params = new URLSearchParams();
  const normalizedTitle = title?.trim();
  if (normalizedTitle) params.set("q", normalizedTitle);
  if (period !== undefined) params.set("period", period);
  const query = params.size === 0 ? "" : `?${params.toString()}`;
  const response = await fetch(`${API_URL}/offers${query}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
