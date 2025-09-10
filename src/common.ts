import { HTTPRequest, type Handler } from "puppeteer";

export const toUrls = (urls: string[]): { remote_urls: string[] } => ({
  remote_urls: urls,
});

export const toError = (msg: string): { msg: string } => ({
  msg: msg,
});

export const filterCriticalFirstPartyRequestsForDomain = (
  base: string,
): Handler<HTTPRequest> => {
  return (req) => {
    const resource = req.resourceType();
    const url = req.url();

    if (
      ["document", "script", "xhr", "fetch", "other"].includes(resource) &&
      url.includes(base)
    ) {
      console.log("ALLOW", { resource, url });
      req.continue();
    } else {
      console.log("BLOCK", { resource, url });
      req.abort();
    }
  };
};
