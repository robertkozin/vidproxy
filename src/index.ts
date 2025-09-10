import { fastdl } from "./fastdl";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { targetMiddleware, pageMiddleware } from "./middleware";
import { toError, toUrls } from "./common";

const app = new Hono();

app.use(logger());

app.get("/", (c) => c.text("OK"));

app.get("/fastdl", targetMiddleware, pageMiddleware, async (c) => {
  return fastdl(c.var.page, c.var.target)
    .then((urls) => c.json(toUrls(urls)))
    .catch((err) => c.json(toError(String(err)), 400));
});

export default app;
