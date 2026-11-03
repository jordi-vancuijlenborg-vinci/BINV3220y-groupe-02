import type { Application } from "../models/application.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isApplication } from "../utils/guards.ts";

export const applyToOffer = async (
  token: string,
  offerId: number,
  message: string,
): Promise<Application> => {
  const response = await fetch(`${API_URL}/offers/${offerId}/applications`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  return readJson(response, isApplication, "Candidature impossible");
};
