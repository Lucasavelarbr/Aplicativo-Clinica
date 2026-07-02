import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface Props extends TextInputProps {
    label: string;
}

export function Input({ label, ...rest }: Props) {
    const { isDarkMode } = useTheme();

    // Definição de cores dinâmicas com base no Modo Escuro / Claro
    const corDoTexto = isDarkMode ? "#FFF" : "#000";
    const corDoPlaceholder = isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(93, 93, 93, 0.6)";

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: corDoTexto }]}> {label} </Text>

            <TextInput 
                style={[styles.input, { color: corDoTexto }]}
                placeholderTextColor={corDoPlaceholder}
                accessibilityLabel={label}
                accessibilityHint={`Campo de ${label}`}
                {...rest}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
});