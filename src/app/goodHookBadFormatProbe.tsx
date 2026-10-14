import { useState } from "node_modules/@types/react";
import { Button, Text } from "react-native";

export function BadHookComponentFixed() {
    const [val, setVal] = useState<string | null>(null);
    return (
        <>
            <Text>{val}</Text>
            <Button
                title={`Make VAL ${val ? "disappear" : "appear"}`}
                onPress={val ? () => setVal(null) : () => setVal("VAL")}
            />
        </>
    );
}
