import { execFileSync } from "node:child_process";
import { renderIcon } from "./lib/icons.js";

const prefix = `/${(process.env.ELEVENTY_PATH_PREFIX || "").replace(/^\/+|\/+$/g, "")}`;
const origin = process.env.SITE_URL || "https://andreymatviyenko.github.io";

export default function (eleventyConfig) {
  eleventyConfig.addShortcode("icon", renderIcon);
  // Use the same CSS build for serve, production, and the CI subpath check.
  eleventyConfig.on("eleventy.before", () => {
    execFileSync("npm", ["run", "build:css"], { stdio: "inherit" });
  });
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.addWatchTarget("lib/");
  eleventyConfig.watchIgnores.add(".cache/**");
  eleventyConfig.addPassthroughCopy({ ".cache/site.css": "assets/site.css" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/assets/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "output/pdf": "assets/resume" });
  eleventyConfig.addFilter("absoluteUrl", (path) =>
    new URL(`${prefix === "/" ? "" : prefix}${path}`, origin).href,
  );
  eleventyConfig.addGlobalData("year", new Date().getUTCFullYear());
  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: `${prefix.replace(/\/$/, "")}/`,
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}

