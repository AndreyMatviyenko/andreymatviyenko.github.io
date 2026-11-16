const profilePath = (lang, profile) =>
  `${lang === "en" ? "/en" : ""}/${profile === "frontend" ? "front-end/" : ""}`;

export default ["uk", "en"].flatMap((lang) =>
  ["deftech", "frontend"].map((profile) => ({
    lang,
    profile,
    path: profilePath(lang, profile),
    alternate: profilePath(lang === "uk" ? "en" : "uk", profile),
    deftech: profilePath(lang, "deftech"),
    frontend: profilePath(lang, "frontend"),
  })),
);
