import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offerId: 1,
    offerTitle: "Application React",
    companyShortName: "Lumen Digital",
    message: "Mon message",
    status: "IN_PROGRESS",
    appliedAt: "2026-10-02 18:10:00",
  },
  {
    id: 2,
    offerId: 2,
    offerTitle: "API REST",
    companyShortName: "Orbis",
    message: null,
    status: "SELECTED",
    appliedAt: "2026-09-02 18:10:00",
  },
  {
    id: 3,
    offerId: 3,
    offerTitle: "Migration cloud",
    companyShortName: "Datavia",
    message: null,
    status: "REJECTED",
    appliedAt: "2026-08-02 18:10:00",
  },
  {
    id: 4,
    offerId: 4,
    offerTitle: "Portail client",
    companyShortName: "Nexalis",
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-07-02 18:10:00",
  },
];

describe("ApplicationsPage", () => {
  it("affiche les candidatures, la date française et les statuts traduits", async () => {
    stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Application React")).toBeInTheDocument();
    expect(screen.getByText("Lumen Digital")).toBeInTheDocument();
    expect(screen.getByText("02/10/2026")).toBeInTheDocument();
    expect(screen.getByText("Mon message")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
  });

  it("affiche une liste vide", async () => {
    stubFetch({ "/api/applications": () => Response.json([]) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Aucune candidature à afficher.")).toBeInTheDocument();
  });

  it("affiche les erreurs de chargement", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 500 }) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 500");
  });

  it("déconnecte sur une session expirée", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
