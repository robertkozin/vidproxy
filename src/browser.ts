import puppeteer from "puppeteer";

const isDev = process.env.NODE_ENV !== "production";

const browser = await puppeteer.launch({
  headless: !isDev,
  executablePath: isDev ? undefined : "/usr/bin/google-chrome",
  args: isDev
    ? ["--disable-images"]
    : ["--disable-images", "--no-sandbox", "--disable-setuid-sandbox"],
});

export const getPage = browser.newPage.bind(browser);
