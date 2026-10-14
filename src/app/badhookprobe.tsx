import { useState } from "node_modules/@types/react";

export function BadHookComponent() {
    const x = 2;
    if (x === 2) {
        const [val, setVal] = useState(null);
        setVal(val);
    }
}
