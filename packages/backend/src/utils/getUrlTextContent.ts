import * as cheerio from "cheerio";

const getUrlTextContent = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("URL is invalid");
  const urlContent = await response.text();
  const $ = cheerio.load(urlContent);
  $("script, style, svg, noscript, iframe, meta, link, head").remove();
  const root = $("main").length ? $("main") : $("body");
  const textBlocks: string[] = [];
  root.find("p, li, h1, h2, h3, h4, h5, h6").each((_, element) => {
    const text = $(element).text().trim();
    if (text) {
      textBlocks.push(text);
    }
  });
  let prev;
  for (let i = 0; i < textBlocks.length; i++) {
    if (textBlocks[i] === prev) {
      textBlocks.splice(i, 1);
      i--;
    }
    prev = textBlocks[i];
  }

  return textBlocks.join("\n");
};

export default getUrlTextContent;
