import type { Application, ApplicationDbo, ApplicationDto } from "../models/application.ts";

export const toApplication = (dbo: ApplicationDbo): Application => ({
  id: dbo.id,
  offerId: dbo.offer_id,
  offerTitle: dbo.offer_title,
  companyShortName: dbo.company_short_name,
  studentId: dbo.student_id,
  message: dbo.message,
  status: dbo.status,
  appliedAt: dbo.applied_at,
});

export const toApplicationDto = (application: Application): ApplicationDto => ({
  id: application.id,
  offerId: application.offerId,
  offerTitle: application.offerTitle,
  companyShortName: application.companyShortName,
  message: application.message,
  status: application.status,
  appliedAt: application.appliedAt,
});
