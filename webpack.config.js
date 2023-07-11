/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

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
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const version = packageJson.version;
    const name = packageJson.name;

    const filename = `${name}-${version}.js`;
    const sourceMapFilename = `../maps/${name}-${version}.js.map`;

    return {
        entry: "./src/index.ts",
        devtool: "hidden-source-map",
        plugins: [
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap("make_pkg.json", () => {
                        const pkg = {
                            name,
                            latest_version: version,
                            latest_timestamp: Date.now(),
                            type: "program",
                            description: packageJson.description,
                            author: packageJson.author,
                            license: packageJson.license,
                            repo_url: packageJson.repository,
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
            filename,
            sourceMapFilename,
            path: path.resolve(__dirname, "dist"),
            library: name,
        },
        externals: {
            "ollieos": "ollieos",
        },
    }
};
