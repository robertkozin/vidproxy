import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: true,
  args: ["--disable-images"],
});

export const getPage = browser.newPage.bind(browser);
