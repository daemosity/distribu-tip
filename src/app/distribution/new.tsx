import { StyleSheet, Text, View } from "react-native";

export default function NewDistribution() {
    return (
        <View style={styles.container}>
            <Text>New Distribution screen.</Text>
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
