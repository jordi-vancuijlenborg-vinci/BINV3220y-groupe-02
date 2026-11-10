import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationStatus } from "../models/application.ts";

interface ApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface ApplicationQuery {
  studentId: number;
}

interface ApplicationByIdQuery {
  id: number;
  studentId: number;
}

interface ApplicationIdQuery {
  id: number;
  studentId: number;
}

interface OfferQuery {
  id: number;
}

interface OfferStatusRow {
  status: string;
}

interface BlockingApplicationRow {
  status: ApplicationStatus;
}

export type CreateApplicationResult =
  | { kind: "OFFER_NOT_FOUND" }
  | { kind: "APPLICATION_ALREADY_EXISTS" }
  | { kind: "CREATED"; application: ApplicationDbo };

export type WithdrawApplicationResult =
  | { kind: "NOT_FOUND" }
  | { kind: "NOT_WITHDRAWABLE" }
  | { kind: "WITHDRAWN"; application: ApplicationDbo };

const applicationSelect = `
  SELECT a.id, a.offer_id, o.title AS offer_title, c.short_name AS company_short_name,
         a.student_id, a.message, a.status, a.applied_at
  FROM applications a
  JOIN offers o ON o.id = a.offer_id
  JOIN companies c ON c.id = o.company_id
`;

export const createApplicationsRepository = (db: Db) => {
  const findAll = db.prepare<ApplicationQuery, ApplicationDbo>(`
    ${applicationSelect}
    WHERE a.student_id = @studentId
    ORDER BY a.applied_at DESC, a.id DESC
  `);

  const findOfferStatus = db.prepare<OfferQuery, OfferStatusRow>(`
    SELECT status FROM offers WHERE id = @id
  `);

  const findBlockingApplication = db.prepare<ApplicationParams, BlockingApplicationRow>(`
    SELECT status
    FROM applications
    WHERE offer_id = @offerId
      AND student_id = @studentId
      AND status IN ('IN_PROGRESS', 'SELECTED', 'REJECTED')
    LIMIT 1
  `);

  const insert = db.prepare<ApplicationParams, { id: number }>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
    RETURNING id
  `);

  const findById = db.prepare<ApplicationByIdQuery, ApplicationDbo>(`
    ${applicationSelect}
    WHERE a.id = @id AND a.student_id = @studentId
  `);

  const findOwnedById = db.prepare<ApplicationIdQuery, ApplicationDbo>(`
    ${applicationSelect}
    WHERE a.id = @id AND a.student_id = @studentId
  `);

  const withdraw = db.prepare<ApplicationIdQuery, { changes: number }>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @id AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  const createApplication = db.transaction((params: ApplicationParams): CreateApplicationResult => {
    const offer = findOfferStatus.get({ id: params.offerId });
    if (offer === undefined || offer.status !== "PUBLISHED") {
      return { kind: "OFFER_NOT_FOUND" };
    }

    if (findBlockingApplication.get(params) !== undefined) {
      return { kind: "APPLICATION_ALREADY_EXISTS" };
    }

    const inserted = insert.get(params);
    if (inserted === undefined) {
      throw new Error("La candidature n'a pas été créée");
    }
    const { id } = inserted;
    const application = findById.get({ id, studentId: params.studentId });
    if (application === undefined) {
      throw new Error("La candidature créée est introuvable");
    }
    return { kind: "CREATED", application };
  });

  const withdrawApplication = db.transaction(
    ({ id, studentId }: ApplicationIdQuery): WithdrawApplicationResult => {
      const current = findOwnedById.get({ id, studentId });
      if (current === undefined) return { kind: "NOT_FOUND" };
      if (current.status !== "IN_PROGRESS") return { kind: "NOT_WITHDRAWABLE" };

      const result = withdraw.run({ id, studentId });
      if (result.changes !== 1) return { kind: "NOT_WITHDRAWABLE" };

      const application = findOwnedById.get({ id, studentId });
      if (application === undefined) {
        throw new Error("La candidature retirée est introuvable");
      }
      return { kind: "WITHDRAWN", application };
    },
  );

  return {
    findAll: (studentId: number): ApplicationDbo[] => findAll.all({ studentId }),
    createApplication,
    withdrawApplication,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
