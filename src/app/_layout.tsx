import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// Ignora os avisos e restrições de Push do Expo Go para o SDK 53+
LogBox.ignoreLogs([
  "expo-notifications", 
  "Android Push notifications",
]);

// Componente interno para gerenciar a renderização e injetar o useTheme na StatusBar
function LayoutContent() {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* A status bar muda de cor dependendo do tema ativo */}
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Telas normais fora das Abas */}
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="registro" />

        {/* Grupo das Navegações por Abas (Tabs) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

// O Layout principal injeta o provedor de tema para o ecossistema inteiro
export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}