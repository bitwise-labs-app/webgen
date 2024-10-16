const nunjucks = require("nunjucks");
const showdown = require("showdown");
const minify = require("html-minifier").minify;

const nodepath = require("path");

const fs = require("fs");

const renderToFile = (path, file, links = [], siteId, bodyAppend, manifest, chapterNumber = 0, lessonNumber = 0, type = null) => {
    const markdown = fs.readFileSync(file, "utf-8").toString();

    const c = new showdown.Converter({ metadata: true, openLinksInNewWindow: true });
    c.setOption('tables', true);
    const html = c.makeHtml(markdown);
    const meta = c.getMetadata();

    let parsedName = `${chapterNumber}.${lessonNumber} - ${meta.name}`;
    let prev = null;
    let next = null;

    const filteredLinks = links.filter(link => link.type != "header");

    const currentIndex = filteredLinks.findIndex(link => link.name == meta.name);

    if (currentIndex != -1 && type != "index" && type != "404") {
        if (currentIndex > 1) {
            prev = filteredLinks[currentIndex - 1];
        }

        if (currentIndex < filteredLinks.length - 1) {
            next = filteredLinks[currentIndex + 1];
        }
    } else if (type == "index") {
        next = filteredLinks[1];
    }

    if (type == "index") {
        parsedName = manifest.indexCustomTitle ?? `Welcome to the ${manifest.courseName} course!`;
    } else if (type == "404") {
        parsedName = "404 Not Found";
    } else if (type == "internal") {
        parsedName = meta.name;
    }

    const njOutput = nunjucks.render(
        nodepath.join(__dirname, "../pages/template.html"),
        {
            meta: {
                courseName: manifest.courseName,
                authors: manifest.courseAuthors
            },
            parsedName,
            links,
            siteId,
            lessonContent: html,
            appendToBody: bodyAppend,
            prev, next,
            manifest
        }
    );

    // Save
    fs.writeFileSync(
        path,
        minify(njOutput, {
            collapseBooleanAttributes: true,
            continueOnParseError: true,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: true,
            quoteCharacter: `"`,
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true
        })
    );
}

module.exports = { renderToFile };
