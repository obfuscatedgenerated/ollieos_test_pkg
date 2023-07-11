/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */



// EDIT THIS OBJECT TO ADD MORE PROGRAMS OR CHANGE THE FILE PATHS/NAMES
// key: the name of the program
// value: the path to the entry point
const programs = {
    "hwpkg": "./src/index.ts",
//    "hwpkg2": "./src/index.ts",
}



const path = require("path");
const fs = require("fs");
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");

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

    return {
        entry: programs,
        devtool: "hidden-source-map",
        plugins: [
            {
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
                    });
                }
            },
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap("make_pkg_json", () => {
                        const pkg = {
                            name,
                            latest_version: version,
                            latest_timestamp: Date.now(),
                            type: "program",
                            description: package_json.description,
                            author: package_json.author,
                            license: package_json.license,
                            repo_url: package_json.repository,
                        };

                        if (readme_content) {
                            pkg.long_desc = readme_content;
                        }

                        fs.writeFileSync("./dist/pkg.json", JSON.stringify(pkg, null, 2));
                        console.log("Wrote pkg.json");
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
                    use: "ts-loader",
                    exclude: /node_modules/,
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
            library: name,
        },
        externals: {
            "ollieos": "ollieos",
        },
    }
};
