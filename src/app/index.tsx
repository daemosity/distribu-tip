import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
    const router = useRouter();
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
