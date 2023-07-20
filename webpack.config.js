/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */



// DON'T EDIT ANYTHING ABOVE THIS LINE
// ================================



// EDIT THIS OBJECT TO ADD MORE PROGRAMS OR CHANGE THE FILE PATHS/NAMES
// key: the name of the program
// value: the path to the entry point
const programs = {
    "hwpkg": "./src/index.ts",
//    "hwpkg2": "./src/index.ts",
}

// EDIT THIS ARRAY TO ADD DEPENDENCIES
// format: name@version
const deps = [

]

// EDIT THIS TO CHANGE THE HOMEPAGE URL
const homepage_url = "https://ollieg.codes"



// DON'T EDIT ANYTHING BELOW THIS LINE
// ================================



const path = require("path");
const fs = require("fs");
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");
const { LimitChunkCountPlugin } = require("webpack").optimize;

fs.mkdirSync("./dist", { recursive: true });

// look for a README, README.txt, or README.md file in the root of the project
const readme_content = (() => {
    const files = ["README", "README.txt", "README.md"];
    for (const file of files) {
        if (fs.existsSync(file)) {
            return fs.readFileSync(file, "utf8");
        }
    }
    return null;
})();

module.exports = (env, argv) => {
    let package_json_content = fs.readFileSync("./package.json", "utf8");
    let package_json = JSON.parse(package_json_content);
    let version = package_json.version;
    let name = package_json.name;

    fs.mkdirSync(`./dist/${version}`, { recursive: true });

    return {
        entry: programs,
        devtool: "hidden-source-map",
        plugins: [
            {
                new LimitChunkCountPlugin({
                    maxChunks: 1
                }),
                apply: (compiler) => {
                    compiler.hooks.compile.tap("update_package_json", () => {
                        let new_package_json_content = fs.readFileSync("./package.json", "utf8");

                        if (new_package_json_content === package_json_content) {
                            return;
                        }

                        console.log("package.json changed, updating");

                        package_json_content = new_package_json_content;
                        package_json = JSON.parse(package_json_content);

                        version = package_json.version;
                        name = package_json.name;

                        fs.mkdirSync(`./dist/${version}`, { recursive: true });
                    });
                }
            },
            {
                apply: (compiler) => {
                    compiler.hooks.done.tap("edit_versions", (stats) => {
                        // if versions.txt doesn't exist, write the current version to it
                        if (!fs.existsSync("./dist/versions.txt")) {
                            fs.writeFileSync("./dist/versions.txt", version);
                            console.log("Wrote versions");
                            return;
                        }

                        // read the current versions.txt
                        const versions = fs.readFileSync("./dist/versions.txt", "utf8");

                        // if the current version is already in versions.txt, don't do anything
                        if (versions.split("\n").map((v) => v.trim()).includes(version)) {
                            return;
                        }

                        // otherwise, append the current version to versions.txt
                        fs.appendFileSync("./dist/versions.txt", `\n${version}`);
                        console.log("Wrote versions");
                    });
                    compiler.hooks.afterEmit.tap("make_pkg_json", () => {
                        const pkg = {
                            latest_version: version,
                            latest_timestamp: Date.now(),
                            type: "program",
                            description: package_json.description,
                            author: package_json.author,
                            license: package_json.license,
                            repo_url: package_json.repository.url,
                            homepage_url,
                            deps,
                        };

                        if (readme_content) {
                            pkg.long_desc = readme_content;
                        }

                        fs.writeFileSync("./dist/pkg.json", JSON.stringify(pkg, null, 2));
                        console.log("Wrote pkg.json");
                    });
                }
            },
            {
                apply: (compiler) => {
                    compiler.hooks.done.tap("make_contents", (stats) => {
                        const assets = stats.toJson().assetsByChunkName;
                        
                        // get list of file names
                        const files = Object.values(assets).flat();

                        // filter out non-js files
                        const filtered_files = files.filter((file) => file.endsWith(".js"));

                        // convert to basenames
                        for (let i = 0; i < filtered_files.length; i++) {
                            filtered_files[i] = path.basename(filtered_files[i]);
                        }

                        const contents = filtered_files.join("\n");

                        fs.writeFileSync(`./dist/${version}/contents.txt`, contents);
                        console.log("Wrote contents");
                    });
                }
            },
            new ExtraWatchWebpackPlugin({
                files: ["package.json"],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    options: {
                        allowTsInNodeModules: true,
                    }
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        output: {
            filename: `./${version}/${name}-[name]-${version}.js`,
            sourceMapFilename: `../maps/${name}-[name]-${version}.js.map`,
            path: path.resolve(__dirname, "dist"),
            library: {
                type: "module",
            }
        },
        externals: {
            "ollieos": "ollieos",
            "howler": "howler",
            "xterm": "xterm",
            "html-to-text": "html-to-text",
            "sixel": "sixel",
            "sweetalert2": "sweetalert2",
            "xterm-addon-fit": "xterm-addon-fit",
            "xterm-addon-web-links": "xterm-addon-web-links",
            "xterm-addon-image": "xterm-addon-image",
            "xterm-link-provider": "xterm-link-provider",
        },
        experiments: {
            outputModule: true,
        },
    }
};
