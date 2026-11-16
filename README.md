# OllieOS Package Build System (pkgbuild)

This project builds a package named `hwpkg` (Hello World Package) for OllieOS. It is a simple example package showing the build system required to build a package for OllieOS.

**You can use this repo as a template, just click `Use this template` to make your own package!**

As of current, packages can only be programs (as opposed to libraries). They are installed to the system's `/usr/bin` directory and are run from the command line. They are not imported into other programs. (Note: the built in programs are found in `/bin` instead, as they are built into the system itself. They are not packages.)

The type interfaces of the OllieOS system to build against are installed through npm using the website's git repo. Types are automatically generated into the types branch on every push to main, so new types may appear before the new OS is published to the web. Webpack and Typescript are used to build the package.

Each program should be bundled to 1 file.

Userspace programs run isolated, in a worker of their own (or a sandboxed frame if they set `needs_dom`). This means:

- Calls to the OS cross a boundary, so most of them return promises. The types tell you what to await (make sure `strictNullChecks` stays on in tsconfig.json, or the program data isn't typed).
- There is no `window` or `document` unless the program sets `needs_dom`, and even then they belong to the program's own frame, not the OS.
- The OS doesn't provide any libraries to programs, so bundle everything you depend on. ANSI helpers can be imported from `ollieos/lib/ansi`.
- Programs should set `compat: "3.0.0"`, as OllieOS 3 won't run programs written for an older major version.

If you wish to instead only write JavaScript (not recommended, your package will not be acccepted!), write directly to the output file instead and jump to the [Completing the package (JavaScript)](#completing-the-package-javascript) section.

## Program API Docs

For the API surface available to programs, [consult the docs](https://ollieg.codes/docs/).

## Building with the OllieOS system

The system is set up automatically to use the version from the package.json file and a README file if found. View [webpack.config.js](webpack.config.js) to configure the programs emitted by the system.

The project may be built using `npm run build`. The output will be in the `dist` directory. Source maps are emitted to the `maps` directory.

You can publish your package by [submitting a pull request to the package repo!](https://github.com/obfuscatedgenerated/pkg_repo)

## Updating OllieOS types and pkgbuild

Once you've installed the dependencies, you can update them easily with `npm update ollieos ollieos_pkgbuild`.

## Getting developed programs into OllieOS (for testing)

Included in this package is a simple script to serve the contents of your dist directory over HTTP, as well as a WebSocket server to notify of changes.

The `npm run dev` command will both automatically build the package and serve it, or you can just serve the files without building with `npx ollieos-pkg-serve`.

This then gives you 2 options to get the files into OllieOS for testing:

### Option 1 - automatic updates with live-pkg

First, install the dev tool group if you haven't already:

```
pkg add dev
```

Now you can run the `live-pkg` command to automatically download and update the package files whenever they change:

```
live-pkg
```

The program files are synced to a temporary directory, updating whenever they change, and live-pkg prints the path to run each program with (e.g. `/tmp/live-pkg/hwpkg`). Any additional files are put in `/usr/lib/<package name>`, just as an install would.

### Option 2 - manual download with webget

The served files will update in real time. You can then use `webget` to copy the program files to OllieOS. Remember that each program needs both its `.js` and `.json` file.

For example, `webget http://localhost:3006/1.0.0/hwpkg.js ./hwpkg.js` and `webget http://localhost:3006/1.0.0/hwpkg.json ./hwpkg.json` to download the hwpkg program to the system.

You can then run the program by its relative path, e.g. `./hwpkg`.

## Completing the package (JavaScript)

As a reminder, writing your programs in JavaScript rather than Typescript will not allow them to be accepted to the package repo!

Once you have the final script ready to be published, you should then write the package info file. If you used the build system, these details will be generated automatically from npm's `package.json`. **The package info file is shared across all versions of the package and does not change for each iteration.** It should be named `pkg.json` and take this format (example):

```json
{
    "latest_version": "1.0.0",
    "latest_timestamp": 1689109292000,
    "type": "program",
    "description": "A simple example package for OllieOS",
    "author": "obfuscatedgenerated",
    "license": "MIT",
    "repo_url": "https://github.com/obfuscatedgenerated/ollieos_test_pkg",
    "homepage_url": "",
    "long_desc": "This is a longer description of the package. If you do not wish to include a long description, you may omit this field."
}
```

The type field exists only for forwards compatibility and should always be set to "program" for now.

The latest_timestamp field is the time the package was built, in milliseconds since the Unix epoch.

---

These files may then be published to the package repo in the following directory structure from the root of the repo (example):

```
provided.txt
pkgs/
    hwpkg/
        versions.txt
        pkg.json
        1.0.0/
            meta.json
            hwpkg.js
            hwpkg.json
```

The `dist` directory generated by the build system is the entire directory in the repo for the package (e.g. dist -> pkgs/hwpkg/).

Each program is a pair of files at the top level of the version directory: `programname.js` and `programname.json`. For example, the directory structure indicates a program named `hwpkg` in a package named `hwpkg`. If it also contained `test.js` and `test.json`, it would indicate a program named `test` in the package. The file names must match the program names, as the OS looks programs up by name. The `.json` file is the program's metadata (its default export, without `main` and `completion`), and its `name` must match the file name.

**Programs must be at the top level of the version directory, along with the meta.json file. A top level `.js` file without a matching `.json` file is treated as an old style package and will be refused.** Any other files (such as additional files) may be placed in subdirectories, and are installed to `/usr/lib/<package name>`, keeping their paths. The names `pkg`, `meta` and `programs` are reserved and can't be used for programs.

The meta.json file provides vital information about the version of the package such as a file listing and dependencies. It is automatically generated by the build system. This file is used to download each file specified. The deps field is an array of dependencies for the package. Each entry should be in the format `name@version`. The externals field must be set to `"global"`, or the package will be refused. Example:

```json
{
  "files": [
    "hwpkg.js",
    "hwpkg.json"
  ],
  "version": "1.0.0",
  "deps": [],
  "triggers": {},
  "build_timestamp": 1727478000908,
  "externals": "global"
}
```

The versions.txt file provides a list of versions of the package, one per line. It is automatically edited by the build system.

Source maps should not be published. The provided.txt file is managed at the root of package repo, listing package names followed by newlines. It should be automatically updated by the package repo (e.g. using GitHub Actions).

It will then be installable inside OllieOS using the following command (example):

```
pkg add hwpkg
```

It can be queried using the following command (example):

```
pkg info hwpkg
```

It can be removed using the following command (example):

```
pkg remove hwpkg
```
