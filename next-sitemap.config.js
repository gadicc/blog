module.exports = {
  siteUrl: "https://blog.gadi.cc",
  generateRobotsTxt: true,
  exclude: ["/server-sitemap.xml"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://blog.gadi.cc/server-sitemap.xml"],
  },
};
