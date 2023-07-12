import type { SyncProgram } from "ollieos/src/types";

export default {
    name: "hwpkg",
    description: "Says hello to the world!",
    usage_suffix: "",
    arg_descriptions: {},
    main: (data) => {
        // extract from data to make code less verbose
        const { term } = data;

        term.writeln("hello package!");

        return 0;
    }
} as SyncProgram;
