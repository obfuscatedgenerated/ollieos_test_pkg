/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const fs = require("fs");

module.exports = (env, argv) => {
    let dt = argv.mode === "development" ? "inline-source-map" : "hidden-source-map";
    console.log(`Building in ${argv.mode} mode`);
    console.log(`Using ${dt}`);

    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const version = packageJson.version;
    const name = packageJson.name;

    const filename = `${name}-${version}.js`;

    return {
        entry: "./src/index.ts",
        devtool: dt,
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
            path: path.resolve(__dirname, "dist"),
            library: name,
        },
        externals: {
            "ollieos": "ollieos",
        },
    }
};