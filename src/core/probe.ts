import { createHmac } from "node:crypto";
import { outsideValue } from "src/outsideFile";
import { insideValue } from "./insideFile";
import { childValue } from "./childFolder/childFile";

const secret = "abcdefg";
const hash = createHmac("sha256", secret)
    .update("I love cupcakes")
    .digest("hex");
console.log(hash, outsideValue, insideValue, childValue);
