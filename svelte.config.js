import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const externalScriptPreprocessor = {
    name: "external-script",
    async script({ content, attributes, filename }) {
        if (!attributes.src) return;

        const sourcePath = resolve(dirname(filename), attributes.src);
        const source = await readFile(sourcePath, "utf8");
        const { src, ...remainingAttributes } = attributes;

        return {
            code: `${content}\n${source}`,
            attributes: remainingAttributes
        };
    }
};

export default {
    preprocess: externalScriptPreprocessor
};
