import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const readFile = (path) => require(path);
