var setPages = [
    "dist/**/*.html",
    "!dist/secret.html"
];

module.exports = {
    fileName: 'sitemap.xml',
    siteUrl: 'https://website.com',
    changefreq: 'monthly',
    priority: '1.0',
    images: 'true',
    pages: setPages,
};