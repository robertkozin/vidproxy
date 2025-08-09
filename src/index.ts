import { fastdl } from "./fastdl";
import { Hono } from "hono";
import { targetMiddleware, pageMiddleware } from "./middleware";
import { toMedia } from "./common";

const app = new Hono();

app.get("/", (c) => c.text("OK"));

app.get("/fastdl", targetMiddleware, pageMiddleware, async (c) => {
  return fastdl(c.var.page, c.var.target).then((urls) => c.json(toMedia(urls)));
});

export default app;
