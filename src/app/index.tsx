import type { AllocationInput } from "@/core";
import {
    allocate,
    formatCents,
    validateCents,
    validateHoursCenti,
    validateWeightBp,
} from "@/core";
import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

const allocationInput: AllocationInput = {
    poolCents: validateCents(10_000),
    carryInCents: validateCents(0),
    workers: [
        {
            id: "workOne",
            hoursCenti: validateHoursCenti(1_000),
            weightBp: validateWeightBp(10_000),
        },
        {
            id: "workTwo",
            hoursCenti: validateHoursCenti(1_000),
            weightBp: validateWeightBp(10_000),
        },
    ],
};

export default function Index() {
    const router = useRouter();

    const payoutRows = allocate(allocationInput).payouts.map((worker) => ({
        id: worker.id,
        amountCents: formatCents(worker.amountCents),
    }));
    return (
        <View style={styles.container}>
            <Text>Edit src/app/index.tsx to edit this screen.</Text>
            <Button
                title="Go to Roster"
                onPress={() => router.navigate("/roster")}
            />
            <Button
                title="Go to distribution screen 1"
                onPress={() => router.navigate("/distribution/1")}
            />
            <Button
                title="Go to new distribution screen"
                onPress={() => router.navigate("/distribution/new")}
            />
            <Button
                title="Go to distribution 1 handoff screen"
                onPress={() => router.navigate("/distribution/1/handoff")}
            />
            {payoutRows.map(({ id, amountCents }) => (
                <View
                    key={id}
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={`${id}, ${amountCents}`}
                >
                    <Text>{id}</Text>
                    <Text>{amountCents}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
