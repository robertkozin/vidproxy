import { fastdl } from "./extractors/fastdl";
import type { Page } from "puppeteer";
import { getPage } from "./browser";

const error = (error: string, status: number = 400) =>
  Response.json({ error }, { status });

type Extractor = (page: Page, target: URL) => Promise<string[]>;

let extractors: Map<string, Extractor> = new Map();
extractors.set("fastdl", fastdl);

const extractHandler = async (req: Request): Promise<Response> => {
  const v: any = await req.json();

  if (!v.target || typeof v.target !== "string") return error("missing target");
  if (!v.extractor || typeof v.extractor !== "string")
    return error("missing extractor");

  const target = URL.parse(v.target);
  if (!target) return error(`could not parse target as url: ${v.target}`);

  const extractor = extractors.get(v.extractor);
  if (!extractor) return error(`extractor not found: ${v.extractor}`, 404);

  const page = await getPage();

  try {
    const urls = await extractor(page, target);
    return Response.json({ remote_urls: urls });
  } catch (err) {
    return error(String(err), 500);
  } finally {
    page.close();
  }
};

Bun.serve({
  routes: {
    "/": new Response(await Bun.file("src/index.html").bytes()),
    "/extract": {
      POST: extractHandler,
    },
    "/bench": (req) => {
      console.time("local");
      local();
      console.timeEnd("local");

      console.time("remote");
      remote();
      console.time("remote");

      return new Response("OK");
    },
  },
});

async function local() {
  let page = await getPage();
  await page.goto("https://example.com");
  return true;
}

async function remote() {
  const response = await fetch("http://browser:3000/function", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: `
        export default async function({ page }) {
          await page.goto('https://example.com');
          return { success: true };
        }
      `,
      context: {},
    }),
  });
}
