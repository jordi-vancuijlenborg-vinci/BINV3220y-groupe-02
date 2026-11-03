import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getAllByText("Autre")).toHaveLength(2);
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("transmet la période choisie à l'API", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "P1" },
    });

    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/offers?period=P1",
      expect.objectContaining({ headers: { Authorization: "jeton" } }),
    ));
  });

  it("affiche le formulaire de candidature uniquement à l'étudiant", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findAllByRole("button", { name: "Candidater" })).toHaveLength(2);
    expect(screen.getAllByLabelText(/Message pour/)).toHaveLength(2);
  });

  it("affiche la confirmation et masque le formulaire après une candidature réussie", async () => {
    stubFetch({
      "/api/offers": () => Response.json(offers),
      "/api/offers/2/applications": () =>
        Response.json({
          id: 7,
          offerId: 2,
          offerTitle: "Refonte du portail client",
          companyShortName: "Lumen Digital",
          message: null,
          status: "IN_PROGRESS",
          appliedAt: "2026-11-03 14:30:00",
        }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");

    const firstButton = screen.getAllByRole("button", { name: "Candidater" }).at(0);
    if (firstButton === undefined) throw new Error("Bouton de candidature introuvable");
    fireEvent.click(firstButton);

    expect(await screen.findByText("Candidature envoyée")).toBeInTheDocument();
    const offerRow = screen.getByText("Refonte du portail client").closest("tr");
    if (offerRow === null) throw new Error("Ligne de l'offre introuvable");
    expect(within(offerRow).queryByRole("button", { name: "Candidater" })).not.toBeInTheDocument();
    expect(within(offerRow).queryByLabelText("Message pour 2")).not.toBeInTheDocument();
  });

  it("affiche le message d'erreur renvoyé lors d'une candidature", async () => {
    stubFetch({
      "/api/offers": () => Response.json(offers),
      "/api/offers/2/applications": () =>
        Response.json(
          { error: { code: "APPLICATION_ALREADY_EXISTS", message: "Candidature déjà existante" } },
          { status: 409 },
        ),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");
    const firstButton = screen.getAllByRole("button", { name: "Candidater" }).at(0);
    if (firstButton === undefined) throw new Error("Bouton de candidature introuvable");
    fireEvent.click(firstButton);

    expect(await screen.findByRole("alert")).toHaveTextContent("Candidature déjà existante");
  });

  it("n'affiche pas d'action de candidature aux contacts", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    await screen.findByText("Refonte du portail client");
    expect(screen.queryByRole("button", { name: "Candidater" })).not.toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
