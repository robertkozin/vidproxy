import { HTTPRequest, type Handler } from "puppeteer";

interface MediaItem {
  url: string;
}

interface GeneralError {
  error_msg: string;
  error_debug: Record<string, any>;
}

type MediaResponse = { media: MediaItem[] } | GeneralError;

export const toMedia = (urls: string[]): { media: MediaItem[] } => ({
  media: urls.map((url) => ({ url })),
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
