import { HTTPRequest, type Handler } from "puppeteer";

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
      req.continue();
    } else {
      req.abort();
    }
  };
};
