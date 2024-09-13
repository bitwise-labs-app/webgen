const fs = require("fs");
const path = require("path");

const { renderToFile } = require("./render.js");
const showdown = require("showdown");

/**
 * @description Generates files for a course to the specified directory
 * @param {string} courseDir The directory that the course's files are located
 * @param {string} outputDir The directory that the course's generated files should be copied to
 */
const render = (courseDir, outputDir, siteId = null) => {
    // Confirm that manifest.json exists
    if (!fs.existsSync(path.join(courseDir, "./manifest.json"))) {
        throw new Error("Missing required file manifest.json");
    }

    // Create new directory if it dosen't already exist
    if (!fs.existsSync(outputDir)) {
        console.log("Missing output directory, creating...");
        fs.mkdirSync(outputDir);
    } else if (fs.readdirSync(outputDir).length != 0) {
        console.log("Need to clear output directory...");
        fs.rmSync(outputDir, { recursive: true });
        fs.mkdirSync(outputDir);

        // Create course and lesson directories
        fs.mkdirSync(path.join(outputDir, "course"));
        fs.mkdirSync(path.join(outputDir, "lesson"));
    } 
    
    // Parse manifest
    const manifest = JSON.parse(
        fs.readFileSync(path.join(courseDir, "./manifest.json"), "utf-8")
            .toString()
    );

    // Include the files in the includeDir
    if (manifest.includeDir) {
        const includeDirPath = path.join(courseDir, manifest.includeDir);
        if (!fs.existsSync(includeDirPath)) {
            throw new Error("includeDir in manifest does not exist");
        }

        console.log(`[Include dir] Copying files from ${manifest.includeDir}`);
        for (const fileName of fs.readdirSync(includeDirPath)) {
            const filePath = path.join(includeDirPath, fileName);

            console.log(`[Include dir] Copy file ${filePath} -> ${path.join(outputDir, fileName)}`);
            fs.copyFileSync(filePath, path.join(outputDir, fileName));
        }
    }

    // Create URLs
    // url-path: path
    const URLs = {};
    const links = [];

    if (manifest.index) {
        URLs["/index.html"] = manifest.index;
        links.push({
            type: "link",
            name: "Home",
            url: "/index.html"
        });
    } else {
        throw new Error("Missing index file!");
    }

    if (manifest.extraCourseInternalPages) {
        manifest.extraCourseInternalPages.forEach(pagePath => {
            // Get the front matter name
            const c = new showdown.Converter({ metadata: true });
            c.makeHtml(
                fs.readFileSync(
                    path.join(courseDir, pagePath),
                    "utf-8"
                ).toString()
            );
            const m = c.getMetadata();
    
            let newURL;
    
            if (m.name) {
                newURL = "/course/" + m.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
                if (URLs[newURL + ".html"]) {
                    throw new Error(`Internal clashing page ${pagePath}`);
                }
    
                newURL += ".html";
     
                URLs[newURL] = pagePath;
            } else {
                throw new Error(`Missing name front matter in internal page ${pagePath}`);
            }
    
            links.push({
                type: "link",
                name: m.name,
                url: newURL
            });
        });
    }

    // Do the same for the lessons
    manifest.content.forEach(chapter => {
        links.push({
            type: "header",
            name: chapter.chapterName,
            url: null
        });

        chapter.lessons.forEach(lesson => {
            // Get the front matter name
            const c = new showdown.Converter({ metadata: true });
            c.makeHtml(
                fs.readFileSync(
                    path.join(courseDir, lesson),
                    "utf-8"
                ).toString()
            );
            const m = c.getMetadata();
            
            let newURL;
            if (m.name) {
                newURL = "/lesson/" + m.name.replace(/[^a-zA-Z]/g, "").toLowerCase();
                if (URLs[newURL + ".html"]) {
                    throw new Error(`Lesson clashing name found ${lesson}`);
                }
                newURL += ".html";

                URLs[newURL] = lesson;
            } else {
                throw new Error(`Missing front matter name in lesson ${lesson}`);
            }

            links.push({
                type: "link",
                name: m.name,
                url: newURL
            });
        });
    });

    // Start rendering
    const bodyAppend = manifest.appendToBody ? fs.readFileSync(
        path.join(courseDir, manifest.appendToBody),
        "utf-8"
    ).toString() : "";

    // copy static files
    fs.cpSync(
        path.join(__dirname, "../pages/static"),
        path.join(outputDir, "static"),
        { recursive: true }
    );

    // index
    renderToFile(
        path.join(outputDir, "index.html"),
        path.join(courseDir, manifest.index),
        links,
        siteId,
        bodyAppend,
        manifest,
        0, 0, "index"
    );
    console.log("[render] rendered index.html");

    // 404
    renderToFile(
        path.join(outputDir, "404.html"),
        path.join(__dirname, "../pages/404.md"),
        links,
        siteId,
        bodyAppend,
        manifest,
        0, 0, "404"
    );
    console.log("[render] rendered 404.html");

    // Internal pages
    if (manifest.extraCourseInternalPages) {
        manifest.extraCourseInternalPages.forEach(pagePath => {
            renderToFile(
                path.join(outputDir, Object.entries(URLs).find(([key, value]) => value === pagePath)?.[0]),
                path.join(courseDir, pagePath),
                links,
                siteId,
                bodyAppend,
                manifest,
                0, 0, "internal"
            );
            console.log(`[render] rendered ${pagePath}`);
        });
    }

    // Lessons
    for (var i = 0; i < manifest.content.length; i++) {
        for (var j = 0; j < manifest.content[i].lessons.length; j++) {
            renderToFile(
                path.join(outputDir, Object.entries(URLs).find(([key, value]) => value === manifest.content[i].lessons[j])?.[0]),
                path.join(courseDir, manifest.content[i].lessons[j]),
                links,
                siteId,
                bodyAppend,
                manifest,
                i + 1, j + 1
            );
            console.log(`[render] rendered ${manifest.content[i].lessons[j]}`);
        }
    }
}

module.exports = { render };