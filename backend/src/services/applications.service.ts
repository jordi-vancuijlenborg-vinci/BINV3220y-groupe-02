import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  createApplication: (viewer: User, offerId: number, message: string | null): Application => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas accès aux candidatures");
    }

    const result = repository.createApplication({
      offerId,
      studentId: viewer.id,
      message,
    });
    if (result.kind === "OFFER_NOT_FOUND") {
      throw new HttpError(404, "NOT_FOUND", "Offre inexistante ou non publiée");
    }
    if (result.kind === "APPLICATION_ALREADY_EXISTS") {
      throw new HttpError(
        409,
        "APPLICATION_ALREADY_EXISTS",
        "Vous avez déjà une candidature active ou traitée pour cette offre",
      );
    }
    return toApplication(result.application);
  },

  listApplications: (viewer: User): Application[] => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Vous n'avez pas accès aux candidatures");
    }
    return repository.findAll(viewer.id).map(toApplication);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
