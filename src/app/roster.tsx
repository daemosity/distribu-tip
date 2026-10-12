import { StyleSheet, Text, View } from "react-native";

export default function Roster() {
    return (
        <View style={styles.container}>
            <Text>Roster screen.</Text>
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
