# OllieOS Package Example

This project builds a package named `hwpkg` (Hello World Package)` for OllieOS. It is a simple example package showing the build system required to build a package for OllieOS.

As of current, packages can only be programs (as opposed to libraries). They are installed to the system's `usr/bin` directory and are run from the command line. They are not imported into other programs. (Note: the built in programs are not found in this directory as they are built into the system itself. They are not packages.)

The OllieOS system to build against is installed through npm using the website's git repo. Webpack and Typescript are used to build the package. OllieOS is declared external to avoid bundling it with the package, but allowing it to be imported.

Each program should be 1 file.

If you wish to instead only write JavaScript, write directly to the output file instead and jump to the [Completing the package](#completing-the-package) section.

## Building with the OllieOS system

The system is set up automatically to use the from the package.json file and a README file if found. View [webpack.config.js](webpack.config.js) to configure the programs emitted by the system.

The project may be built using `npm run build`. The output will be in the `dist` directory. Source maps are emitted to the `maps` directory.

## Completing the package

Once you have the final script ready to be published, you should then write the package info file. If you used the build system, these details will be generated automatically. **The package info file is shared across all versions of the package and does not change for each iteration.** It should be named `pkg.json` and take this format (example):

```json
{
    "name": "hwpkg",
    "latest_version": "1.0.0",
    "latest_timestamp": 1689109292,
    "type": "program",
    "description": "A simple example package for OllieOS",
    "author": "obfuscatedgenerated",
    "license": "MIT",
    "repo_url": "https://github.com/obfuscatedgenerated/ollieos_test_pkg",
    "long_desc": "This is a longer description of the package. If you do not wish to include a long description, you may omit this field."
}
```

The type field exists only for forwards compatibility and should always be set to "program" for now.

The latest_timestamp field is the time the package was built, in seconds since the Unix epoch.

---

These files may then be published to the package repo in the following directory structure from the root of the repo (example):

```
provided.txt
pkgs/
    hwpkg/
        pkg.json
        1.0.0/
            hwpkg-hwpkg-1.0.0.js
```

Each file in the directory is a program. The convention for naming each script file is `packagename-programname-version.js`. For example, the directory structure shows a program named `hwpkg` in a package named `hwpkg`. If it was named `hwpkg-test-1.0.0.js`, it would show a program named `test` in the package. These are purely conventions but should be followed for consistency. The OS will still load any file in the directory as a program, using the program names and other data defined in each source file.

**Every package file should be in the same directory (the version number). Nothing else should be in this directory. All files in the directory are mounted.**

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
