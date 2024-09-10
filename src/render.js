const nunjucks = require("nunjucks");
const showdown = require("showdown");

const nodepath = require("path");

const fs = require("fs");

const renderToFile = (path, file, links, siteId, bodyAppend, manifest, chapterNumber = 0, lessonNumber = 0, type = null) => {
    const markdown = fs.readFileSync(file, "utf-8").toString();

    const c = new showdown.Converter({ metadata: true, openLinksInNewWindow: true });
    const html = c.makeHtml(markdown);
    const meta = c.getMetadata();

    let parsedName = `${chapterNumber}.${lessonNumber} - ${meta.name}`;

    if (type == "index") {
        parsedName = `Welcome to the ${manifest.courseName} course on idkHow`
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
            appendToBody: bodyAppend
        }
    );

    // Save
    fs.writeFileSync(
        path,
        njOutput
    );
}

module.exports = { renderToFile };