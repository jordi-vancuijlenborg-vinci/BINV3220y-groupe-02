import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const MAX_MESSAGE_LENGTH = 1000;

const parseOfferId = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "INVALID_PARAM", "L'identifiant de l'offre est invalide");
  }
  return id;
};

const parseApplicationId = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "INVALID_BODY", "L'identifiant de la candidature est invalide");
  }
  return id;
};

const parseMessage = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit être un objet JSON");
  }
  const message = (body as { message?: unknown }).message;
  if (message === undefined || message === null) return null;
  if (typeof message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "Le message doit être une chaîne de caractères");
  }
  const trimmed = message.trim();
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(
      400,
      "INVALID_BODY",
      `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères`,
    );
  }
  return trimmed === "" ? null : trimmed;
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(
      applicationsService.listApplications(getCurrentUser(req)).map(toApplicationDto),
    );
  });

  router.post("/:applicationId/withdraw", (req, res) => {
    const application = applicationsService.withdrawApplication(
      getCurrentUser(req),
      parseApplicationId(req.params.applicationId),
    );
    res.json(toApplicationDto(application));
  });

  return router;
};

export const createOfferApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.post("/:offerId/applications", (req, res) => {
    const offerId = parseOfferId(req.params.offerId);
    const application = applicationsService.createApplication(
      getCurrentUser(req),
      offerId,
      parseMessage(req.body),
    );
    res.status(201).json(toApplicationDto(application));
  });

  return router;
};
