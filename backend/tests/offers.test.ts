import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const listOffersAs = (kind: UserKind, id: number) =>
  request(app).get("/offers").set("Authorization", tokenFor(kind, id));

const offerIds = (body: { id: number }[]): number[] => body.map((offer) => offer.id);

describe("GET /offers : accès", () => {
  it("refuse une requête sans session (401)", async () => {
    const response = await request(app).get("/offers");

    expect(response.status).toBe(401);
  });

  it.each([
    ["promoteur et signataire", CONTACT.NADIA_CHERIF],
    ["signataire uniquement", CONTACT.NATHALIE_RENARD],
    ["promoteur uniquement", CONTACT.LAURA_SIMON],
  ])("refuse un contact %s (403)", async (_profile, id) => {
    const response = await listOffersAs("CONTACT", id);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("GET /offers : visibilité selon le profil", () => {
  it("montre toutes les offres à un administrateur, de la plus récente année à la plus ancienne", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
    expect(response.body.at(-1)).toEqual({
      id: OFFER.PDF_REPORTS,
      title: "Module de rapports PDF",
      companyShortName: "Orbis",
      academicYear: "2025-2026",
      period: "P1",
      status: "ARCHIVED",
    });
  });

  it("ne montre que les offres publiées à un étudiant", async () => {
    const response = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT);

    expect(offerIds(response.body)).toEqual([
      OFFER.INTERNAL_CHATBOT,
      OFFER.DATA_QUALITY,
      OFFER.FLEET_APP,
      OFFER.BILLING_API,
    ]);
    expect(response.body.every((o: { status: string }) => o.status === "PUBLISHED")).toBe(true);
  });

  it("filtre les offres par période sans contourner la visibilité", async () => {
    const response = await request(app)
      .get("/offers?period=P1")
      .set("Authorization", tokenFor("CONTACT", CONTACT.MARC_LEJEUNE));

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([OFFER.PDF_REPORTS]);
    expect(response.body.every((offer: { period: string }) => offer.period === "P1")).toBe(true);
  });

  it("recherche une expression dans le titre sans distinguer la casse ni les espaces extérieurs", async () => {
    const response = await request(app)
      .get("/offers?q=%20API%20REST%20")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([OFFER.BILLING_API]);
  });

  it("ignore une recherche composée uniquement d'espaces", async () => {
    const withoutSearch = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);
    const withSpaces = await request(app)
      .get("/offers?q=%20%20")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

    expect(withSpaces.status).toBe(200);
    expect(offerIds(withSpaces.body)).toEqual(offerIds(withoutSearch.body));
  });

  it.each(["%", "_"])(
    "traite le caractère spécial %s comme du texte littéral dans la recherche",
    async (character) => {
      const response = await request(app)
        .get(`/offers?q=${encodeURIComponent(character)}`)
        .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    },
  );

  it("combine la recherche par titre avec le filtre de période", async () => {
    const response = await request(app)
      .get("/offers?q=application&period=P2")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([OFFER.FLEET_APP, OFFER.CLOUD_MIGRATION]);
  });

  it("conserve la visibilité publiée pour la recherche d'un étudiant", async () => {
    const response = await request(app)
      .get("/offers?q=application")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(offerIds(response.body)).toEqual([OFFER.FLEET_APP]);
    expect(response.body.every((offer: { status: string }) => offer.status === "PUBLISHED")).toBe(
      true,
    );
  });

  it("retourne une liste vide quand aucun titre ne correspond", async () => {
    const response = await request(app)
      .get("/offers?q=introuvable")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it.each(["INVALID", "P1&period=P2"])("refuse une période invalide ou répétée (%s)", async (query) => {
    const response = await request(app)
      .get(`/offers?period=${query}`)
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
  });

  it("montre à un déposant toutes ses offres, quel que soit leur statut", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.MARC_LEJEUNE);

    expect(offerIds(response.body)).toEqual([
      OFFER.E2E_TESTS,
      OFFER.BILLING_API,
      OFFER.PDF_REPORTS,
    ]);
  });

  it("ne montre pas à un déposant l'offre d'un collègue de la même entreprise", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.CLAIRE_DUMONT);

    expect(offerIds(response.body)).toEqual([OFFER.FLEET_APP]);
    expect(offerIds(response.body)).not.toContain(OFFER.CLIENT_PORTAL);
  });

  it("montre à un contact multi-entreprises ses offres dans ses deux entreprises", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.JULIEN_LAMBERT);

    expect(response.body.map((o: { companyShortName: string }) => o.companyShortName)).toEqual([
      "Lumen Digital",
      "Lumen Data",
    ]);
    expect(offerIds(response.body)).toEqual([OFFER.CLIENT_PORTAL, OFFER.DATA_QUALITY]);
  });

  it("n'expose que les champs du DTO", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(Object.keys(response.body[0]).sort()).toEqual(
      ["academicYear", "companyShortName", "id", "period", "status", "title"],
    );
  });
});
