import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useTheme } from "../../context/ThemeContext"; // Ajuste o caminho se necessário

export default function TabsLayout() {
  const { isDarkMode } = useTheme();

  const blurTint = isDarkMode ? "dark" : "light";
  const corIconeAtivo = isDarkMode ? "#FFF" : "#5c27c6"; // Branco no dark, Roxo no light
  
  // SOLUÇÃO 3: Preto Puro (#000000) no modo claro, com opacidade sutil no dark
  const corIconeInativo = isDarkMode ? "rgba(255, 255, 255, 0.5)" : "#000000";

  // Cor de fundo para reforçar o efeito fosco
  const corFundoTab = isDarkMode ? "rgba(18, 18, 18, 0.6)" : "rgba(255, 255, 255, 0.7)"; 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: corIconeAtivo,
        tabBarInactiveTintColor: corIconeInativo,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 75,
          backgroundColor: corFundoTab,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint={blurTint}
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarAccessibilityLabel: "Início",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} 
            size={26} 
            color={color}
            accessible={false}
            importantForAccessibility="no" />
          ),
        }}
      />
      <Tabs.Screen
        name="agendar"
        options={{
          title: "Agendar",
          tabBarAccessibilityLabel: "Agendar Consulta",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="calendar-outline" 
            size={26} 
            color={color} 
            accessible={false}
            importantForAccessibility="no" />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarAccessibilityLabel: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} 
            size={26} 
            color={color} 
            accessible={false}
            importantForAccessibility="no"/>
          ),
        }}
      />
      {/* Adicionei a aba de configurações que estava oculta por engano */}
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Configurações",
          tabBarAccessibilityLabel: "Configurações",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} 
            size={26} 
            color={color} 
            accessible={false}
            importantForAccessibility="no"/>
          ),
        }}
      />
    </Tabs>
  );
}