import { expect, test, type Page } from "@playwright/test";

const openOffersAsLucas = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lucas Dupont" }).click();

  const navigation = page.getByRole("navigation", {
    name: "Navigation principale",
  });
  const offersLink = navigation.getByRole("link", { name: "Offres" });
  await expect(offersLink).toBeVisible();
  await offersLink.click();
  await expect(
    page.getByRole("heading", { name: "Offres de stage" }),
  ).toBeVisible();
};

test("Scénario 1 — recherche avec résultat et vérification de la visibilité", async ({
  page,
}) => {
  await openOffersAsLucas(page);

  await page
    .getByRole("searchbox", { name: "Rechercher dans les titres" })
    .fill("  API  ");

  await expect(page.getByText("1 offre", { exact: true })).toBeVisible();

  const offersTable = page.getByRole("table");
  await expect(offersTable).toBeVisible();
  await expect(offersTable.getByRole("row")).toHaveCount(2);
  await expect(
    offersTable.getByRole("cell", {
      name: "API REST de facturation",
      exact: true,
    }),
  ).toBeVisible();
  await expect(offersTable).not.toContainText("Numérisation d'archives papier");
});

test("Scénario 2 — recherche sans résultat", async ({ page }) => {
  await openOffersAsLucas(page);

  await page
    .getByRole("searchbox", { name: "Rechercher dans les titres" })
    .fill("zzz");

  await expect(
    page.getByText("Aucune offre ne correspond à votre recherche.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});
