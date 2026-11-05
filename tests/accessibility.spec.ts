import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const localOrigin = "http://127.0.0.1:4173";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === localOrigin) {
      await route.continue();
    } else {
      await route.abort();
    }
  });
});

function getRoutes(directory: string, parent = ""): string[] {
  return readdirSync(join(directory, parent), { withFileTypes: true }).flatMap((entry) => {
    const path = [parent, entry.name].filter(Boolean).join(sep);
    if (entry.isDirectory()) {
      return entry.name === "admin" ? [] : getRoutes(directory, path);
    }
    if (entry.name !== "index.html") return [];
    const segments = relative(directory, join(directory, path)).split(sep);
    segments.pop();
    return [`/${segments.join("/")}${segments.length ? "/" : ""}`];
  });
}

function analyzePage(page: Page) {
  return new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag2aaa",
      "wcag21a",
      "wcag21aa",
      "wcag21aaa",
      "wcag22a",
      "wcag22aa",
      "wcag22aaa",
      "best-practice",
    ])
    .options({ iframes: false })
    .setLegacyMode(true)
    .analyze();
}

async function checkRoutes(page: Page, viewport: { width: number; height: number }) {
  const routes = getRoutes("dist").sort();
  const failures: string[] = [];
  expect(routes.length, "No published pages found in dist").toBeGreaterThan(0);
  await page.setViewportSize(viewport);

  for (const route of routes) {
    await test.step(`axe: ${route}`, async () => {
      const response = await page.goto(route);
      expect(response?.ok(), `Could not load ${route}`).toBeTruthy();
      await expect(page.locator("h1"), `Expected one page heading on ${route}`).toHaveCount(1);
      const untitledFrames = await page
        .locator("iframe")
        .evaluateAll((frames: HTMLIFrameElement[]) =>
          frames
            .filter((frame) => !frame.title.trim())
            .map((frame) => frame.getAttribute("src") ?? "(no src)"),
        );
      expect(untitledFrames, `Untitled iframes on ${route}`).toEqual([]);

      const results = await analyzePage(page);

      failures.push(
        ...results.violations.map(
          (violation) =>
            `${route}: ${violation.impact ?? "unknown"} ${violation.id} — ${violation.help}; ` +
            violation.nodes.map((node) => node.target.join(", ")).join(" | "),
        ),
      );
    });
  }

  expect(failures, "Accessibility violations:\n" + failures.join("\n")).toEqual([]);
}

test("all published pages meet automated WCAG checks on desktop", async ({ page }) => {
  await checkRoutes(page, { width: 1280, height: 900 });
});

test("all published pages meet automated WCAG checks at 320px and reflow without horizontal scrolling", async ({
  page,
}) => {
  const routes = getRoutes("dist").sort();
  await checkRoutes(page, { width: 320, height: 812 });
  for (const route of routes) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")]
        .filter((element) => element.scrollWidth > element.clientWidth)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: typeof element.className === "string" ? element.className : "",
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        }))
        .slice(0, 10),
    }));
    expect(
      dimensions.content,
      `Horizontal overflow on ${route}: ${JSON.stringify(dimensions.overflow)}`,
    ).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("the not-found page meets automated WCAG checks", async ({ page }) => {
  const response = await page.goto("/page-inexistante-pour-test/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveCount(1);
  expect((await analyzePage(page)).violations).toEqual([]);
});

test("the skip link is keyboard accessible and moves focus to the main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Aller au contenu" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#contenu$/);
  await expect(page.locator("main")).toBeFocused();
});
