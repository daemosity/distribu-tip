import { insideValue } from "./insideFile";
import { childValue } from "./childFolder/childFile";

export const secret = insideValue + childValue;
