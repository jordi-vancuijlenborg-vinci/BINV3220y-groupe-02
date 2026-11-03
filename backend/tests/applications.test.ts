import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICATION, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const applyAs = (kind: "STUDENT" | "CONTACT", id: number, offerId: number, message?: string) =>
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
