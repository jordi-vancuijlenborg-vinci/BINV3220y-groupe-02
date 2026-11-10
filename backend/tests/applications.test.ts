import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, APPLICATION, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

let app: ReturnType<typeof createTestApp>;
let db: ReturnType<typeof createTestDatabase>;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

const applyAs = (
  kind: "ADMIN" | "STUDENT" | "CONTACT",
  id: number,
  offerId: number,
  message?: string,
) =>
  request(app)
    .post(`/offers/${offerId}/applications`)
    .set("Authorization", tokenFor(kind, id))
    .send(message === undefined ? {} : { message });

describe("POST /offers/:offerId/applications", () => {
  it("crée une candidature étudiante sur une offre publiée", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY, "  Intéressé.  ");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.DATA_QUALITY,
      message: "Intéressé.",
      status: "IN_PROGRESS",
    });
  });

  it("accepte une candidature sans message", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY);

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("autorise une nouvelle candidature après retrait", async () => {
    const response = await applyAs("STUDENT", STUDENT.INES_HADDAD, OFFER.BILLING_API, "Nouvelle");

    expect(response.status).toBe(201);
    expect(response.body.offerId).toBe(OFFER.BILLING_API);
    expect(response.body.id).not.toBe(APPLICATION.INES_BILLING_API);
  });

  it.each([OFFER.CLOUD_MIGRATION, OFFER.E2E_TESTS])(
    "refuse une offre non publiée (%s) comme inexistante",
    async (offerId) => {
      const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, offerId);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    },
  );

  it("refuse une candidature active ou traitée", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.FLEET_APP);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_ALREADY_EXISTS");
  });

  it("refuse un contact", async () => {
    const response = await applyAs("CONTACT", CONTACT.MARC_LEJEUNE, OFFER.DATA_QUALITY);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("refuse un message trop long", async () => {
    const response = await applyAs(
      "STUDENT",
      STUDENT.LUCAS_DUPONT,
      OFFER.DATA_QUALITY,
      "x".repeat(1001),
    );

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });
});

describe("GET /applications", () => {
  it("retourne les candidatures de l'étudiant avec les quatre statuts", async () => {
    db
      .prepare(
        `INSERT INTO applications (offer_id, student_id, message, status, applied_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(OFFER.INTERNAL_CHATBOT, STUDENT.INES_HADDAD, "Retenue", "SELECTED", "2026-09-20 10:00:00");
    db
      .prepare(
        `INSERT INTO applications (offer_id, student_id, message, status, applied_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(OFFER.DATA_QUALITY, STUDENT.INES_HADDAD, "Non retenue", "REJECTED", "2026-09-21 10:00:00");

    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));

    expect(response.status).toBe(200);
    expect(response.body.map((application: { status: string }) => application.status)).toEqual([
      "IN_PROGRESS",
      "WITHDRAWN",
      "REJECTED",
      "SELECTED",
    ]);
  });

  it("ne retourne pas les candidatures d'un autre étudiant", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body.every((application: { studentId?: number }) => application.studentId === undefined)).toBe(
      true,
    );
    expect(response.body.map((application: { id: number }) => application.id)).toEqual([
      APPLICATION.LUCAS_FLEET_APP,
    ]);
  });

  it("refuse les administrateurs et les contacts", async () => {
    const adminResponse = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));
    const contactResponse = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("CONTACT", CONTACT.MARC_LEJEUNE));

    expect(adminResponse.status).toBe(403);
    expect(contactResponse.status).toBe(403);
  });

  it("refuse une requête sans session", async () => {
    expect((await request(app).get("/applications")).status).toBe(401);
  });
});

describe("POST /offers/:offerId/applications : autorisation", () => {
  it("refuse une candidature d'un administrateur", async () => {
    const response = await applyAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ, OFFER.DATA_QUALITY);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("POST /applications/:applicationId/withdraw", () => {
  it("retire une candidature en cours et renvoie le DTO mis à jour", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: APPLICATION.LUCAS_FLEET_APP,
      status: "WITHDRAWN",
    });
    expect(
      db
        .prepare("SELECT status FROM applications WHERE id = ?")
        .get(APPLICATION.LUCAS_FLEET_APP),
    ).toEqual({ status: "WITHDRAWN" });
  });

  it.each([
    ["retenue", APPLICATION.MATEUSZ_CLOUD_MIGRATION],
    ["non retenue", APPLICATION.LEA_CLOUD_MIGRATION],
    ["retirée", APPLICATION.INES_BILLING_API],
  ])("refuse le retrait d'une candidature %s", async (_label, applicationId) => {
    const student =
      applicationId === APPLICATION.MATEUSZ_CLOUD_MIGRATION
        ? STUDENT.MATEUSZ_KOWALSKI
        : applicationId === APPLICATION.LEA_CLOUD_MIGRATION
          ? STUDENT.LEA_MERTENS
          : STUDENT.INES_HADDAD;
    const response = await request(app)
      .post(`/applications/${applicationId}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", student));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });

  it("refuse la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("refuse un identifiant inexistant", async () => {
    const response = await request(app)
      .post("/applications/999/withdraw")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it.each([
    ["administrateur", "ADMIN" as const, ADMINISTRATOR.ANNE_LECLERCQ],
    ["contact", "CONTACT" as const, CONTACT.MARC_LEJEUNE],
  ])("refuse le retrait par un %s", async (_label, kind, id) => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor(kind, id));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("Candidatures : cas complémentaires", () => {
  // Ce test échouerait si une candidature SELECTED ou REJECTED ne bloquait plus une nouvelle candidature.
  it.each(["SELECTED", "REJECTED"] as const)(
    "refuse une nouvelle candidature après une candidature %s et ne crée qu'une seule ligne",
    async (status) => {
      db
        .prepare(
          `INSERT INTO applications (offer_id, student_id, message, status, applied_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(OFFER.DATA_QUALITY, STUDENT.LUCAS_DUPONT, "Traitée", status, "2026-10-05 10:00:00");

      const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("APPLICATION_ALREADY_EXISTS");
      expect(
        db
          .prepare("SELECT COUNT(*) AS count FROM applications WHERE offer_id = ? AND student_id = ?")
          .get(OFFER.DATA_QUALITY, STUDENT.LUCAS_DUPONT),
      ).toEqual({ count: 1 });
    },
  );

  // Ce test échouerait si une offre inexistante était traitée comme une offre publiable.
  it("refuse l'offre 999", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, 999);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  // Ce test échouerait si un message composé uniquement d'espaces n'était pas normalisé en null.
  it("accepte un message composé uniquement d'espaces avec un message null", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY, "   ");

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  // Ce test échouerait si la limite de longueur autorisait moins de 1000 caractères.
  it("accepte un message de 1000 caractères exactement", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY, "x".repeat(1000));

    expect(response.status).toBe(201);
  });
});
