import { type HTTPResponse } from "puppeteer";
import * as common from "./common";
import type { Page } from "puppeteer";

function findBestURL(m: MediaURL[]): string {
  if (!m || m.length === 0) {
    return "";
  }

  return m?.[0]?.url ?? "";
}

export async function fastdl(page: Page, target: URL): Promise<string[]> {
  await page.setRequestInterception(true);

  let { promise, resolve, reject } = Promise.withResolvers<string[]>();

  setTimeout(() => {
    reject("timeout 15s");
  }, 15_000);

  page.on(
    "request",
    common.filterCriticalFirstPartyRequestsForDomain("fastdl.app"),
  );

  page.on("response", async (response: HTTPResponse) => {
    const [method, url, ok, headers] = [
      response.request().method(),
      response.url(),
      response.ok(),
      response.headers(),
    ];

    if (method !== "POST" || !url.includes("/api/convert")) return;

    if (headers["content-type"] === "application/json") {
      const data: FastdlResponse = await response.json();

      if (isErrorResponse(data)) {
        reject(data.message); // TODO better formatting
      } else if (isMediaArray(data)) {
        const urls = data.map((item) => findBestURL(item.url));
        resolve(urls);
      } else if (isSingleMedia(data)) {
        const url = findBestURL(data.url);
        resolve([url]);
      } else {
        reject("unexpected value"); // TODO: add more data
      }
    } else {
      reject("unexpected content type"); // todo: add more data
    }
  });

  await page.goto("https://fastdl.app/en", {
    waitUntil: "domcontentloaded",
  });

  await page.type("form input", target.toString());

  await page.click('form button[type="submit"]');

  return promise;
}

// Base media item structure
interface MediaItem {
  url: MediaURL[];
  meta: {
    title: string;
    source: string;
    shortcode: string;
    comments: Array<{
      text: string;
      username: string;
    }>;
    comment_count: number;
    like_count: number;
    taken_at: number;
    username?: string;
  };
  thumb: string;
  hosting?: string;
  sd?: {
    url: string;
  } | null;
  hd?: {
    url: string;
  } | null;
  timestamp?: number;
}

interface MediaURL {
  url: string;
  name: string;
  type: string;
  ext: string;
  with_watermark?: boolean;
  subname?: string;
}

// Error response structure
interface ErrorResponse {
  code: number;
  message: string;
  data: any[];
}

// Union type for the API response
type FastdlResponse = MediaItem | MediaItem[] | ErrorResponse;

// Type guard functions
function isErrorResponse(response: FastdlResponse): response is ErrorResponse {
  return "code" in response && "message" in response;
}

function isMediaArray(response: FastdlResponse): response is MediaItem[] {
  return Array.isArray(response);
}

function isSingleMedia(response: FastdlResponse): response is MediaItem {
  return !Array.isArray(response) && "url" in response && "meta" in response;
}
