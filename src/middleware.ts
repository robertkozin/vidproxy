import { createMiddleware } from "hono/factory";
import type { Page } from "puppeteer";
import { getPage } from "./browser";

export const targetMiddleware = createMiddleware<{
  Variables: {
    target: URL;
  };
}>(async (c, next) => {
  let targetParam: string | undefined;
  if (c.req.method == "GET") {
    targetParam = c.req.query("target");
  } else if (c.req.method == "POST") {
    targetParam = await c.req.json().then((body) => body.target);
  }

  if (!targetParam) {
    return c.json({ msg: "expecting target param" }, 400);
  }
  const targetUrl = URL.parse(targetParam);
  if (!targetUrl) {
    return c.json({ msg: "parsing target param as url" }, 400);
  }

  c.set("target", targetUrl);
  await next();
});

export const pageMiddleware = createMiddleware<{
  Variables: {
    page: Page;
  };
}>(async (c, next) => {
  const page = await getPage();
  c.set("page", page);
  try {
    await next();
  } finally {
    page.close();
  }
});
