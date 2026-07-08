import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { AccessibilityInfo, Alert, Linking, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function Configuracoes() {
    const { isDarkMode, toggleTheme } = useTheme();
    const [notificacoes, setNotificacoes] = useState(true);
    const [modalLgpdVisible, setModalLgpdVisible] = useState(false);

    // FUNÇÃO DE LOGOUT TRADICIONAL RESTAURADA (Sem biometria)
    async function fazerLogout() {
        try {
           setTimeout(()=>{
            router.replace("/login")},800)
        } catch (error) {
            Alert.alert("Erro", "Não foi possível sair do aplicativo.");
        }
    }

    // FUNÇÃO PARA SIMULAR EXCLUSÃO DE CONTA (Restaurada ao original)
    function confirmarExclusaoConta() {
        Alert.alert(
            "Excluir Conta",
            "Tem certeza de que deseja apagar seus dados? Esta ação é irreversível.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    style: "destructive", 
                    onPress: () => {
                        Alert.alert("Sucesso", "Dados removidos.");
                        router.replace("/login");
                    } 
                }
            ]
        );
    }

        AccessibilityInfo.announceForAccessibility(
            "Logout realizado."
        )

    // Cores Dinâmicas baseadas no Tema Global
    const corFundo = isDarkMode ? "#121212" : "#FFF";
    const corTexto = isDarkMode ? "#FFF" : "#000";
    const corSubtitulo = isDarkMode ? "#aaa" : "#666";
    const corCardFundo = isDarkMode ? "#1E1E1E" : "#f9f9f9";
    const corSecaoTitulo = isDarkMode ? "#BFA2F7" : "#5c27c6";
    const corLinhaDivisoria = isDarkMode ? "#2D2D2D" : "#EAEAEA";

    // FUNÇÃO DE SUPORTE NO WHATSAPP

    const whatsapp = async () => {
        const numero = "5511965765805";
        const mensagem = "Olá, preciso de suporte para o aplicativo Clínica Estácio";
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Erro', 'WhatsApp não instalado.');
        }
    }

    return (
        <SafeAreaView style={[styles.containerPrincipal, { backgroundColor: corFundo }]}>
            
            {/* MODAL COMPLETO DE PRIVACIDADE E LGPD */}
            <Modal accessibilityViewIsModal={true} animationType="fade" transparent={true} visible={modalLgpdVisible}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: corCardFundo }]}>
                        <View style={styles.modalHeader}>
                            <Text accessibilityRole="header" style={[styles.modalTitle, { color: corTexto }]}>Termos e Privacidade (LGPD)</Text>
                            <TouchableOpacity accessibilityLabel="Privacidade e Termos" accessibilityHint="Abre os termos de uso e privacidade." onPress={() => setModalLgpdVisible(false)}>
                                <Ionicons accessibilityRole="button" accessibilityLabel="Fechar"
                                    accessibilityHint="Fecha os termos de privacidade." name="close" size={24} color={corTexto} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.lgpdTexto, { color: corTexto }]}>
                                Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), informamos como os seus dados pessoais são tratados neste aplicativo escolar:{"\n\n"}
                                
                                <Text style={styles.lgpdDestaque}>1. Coleta de Dados:{"\n"}</Text>
                                Coletamos seu nome completo, e-mail, número de CPF, telefone e foto de perfil para identificação e vinculação única no sistema.{"\n\n"}

                                <Text style={styles.lgpdDestaque}>2. Finalidade do Tratamento:{"\n"}</Text>
                                Os dados são utilizados exclusivamente para permitir o agendamento de consultas, liberação de salas e controle estatístico interno do projeto. Seus dados nunca serão comercializados ou compartilhados com terceiros.{"\n\n"}

                                <Text style={styles.lgpdDestaque}>3. Segurança da Informação:{"\n"}</Text>
                                O armazenamento é realizado através da infraestrutura em nuvem do Firebase (Google), utilizando protocolos criptografados para garantir que suas informações estejam seguras contra acessos não autorizados.{"\n\n"}

                                <Text style={styles.lgpdDestaque}>4. Seus Direitos (Revogação e Exclusão):{"\n"}</Text>
                                Você detém total controle sobre seus dados. A qualquer momento, você pode atualizar suas informações na aba de Perfil ou solicitar a exclusão definitiva do seu registro através do botão "Excluir minha conta", o que removerá todos os seus registros de forma permanente de nossas bases de dados.
                            </Text>
                        </ScrollView>

                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Li e concordo" accessibilityHint="Fecha os termos." style={styles.modalBotaoFechar} onPress={() => setModalLgpdVisible(false)}>
                            <Text style={styles.modalBotaoTexto}>Li e concordo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* CONTEÚDO PRINCIPAL DAS CONFIGURAÇÕES */}
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <Text  accessibilityRole="header" style={[styles.headerTitle, { color: corTexto }]}>Configurações</Text>
        </View>

        {/* SEÇÃO: SEGURANÇA */}
        <Text accessibilityRole="header" style={[styles.secaoTitulo, { color: corSecaoTitulo }]}>SEGURANÇA</Text>
        <View style={[styles.cardGrupo, { backgroundColor: corCardFundo }]}>
            <TouchableOpacity style={styles.linhaOpcao} onPress={() => setModalLgpdVisible(true)}>
                <View style={styles.linhaEsquerda}>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#5c27c6" />
                    <Text style={[styles.opcaoTexto, { color: corTexto }]}>Privacidade e Termos</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={corSubtitulo} />
            </TouchableOpacity>
        </View>

        {/* SEÇÃO: PREFERÊNCIAS */}
        <Text style={[styles.secaoTitulo, { color: corSecaoTitulo }]}>PREFERÊNCIAS</Text>
        <View style={[styles.cardGrupo, { backgroundColor: corCardFundo }]}>
            <View style={[styles.divisor, { backgroundColor: corLinhaDivisoria }]} />
            <View style={styles.linhaOpcao}>
                <View style={styles.linhaEsquerda}>
                    <Ionicons name="moon-outline" size={22} color="#5c27c6" />
                    <Text style={[styles.opcaoTexto, { color: corTexto }]}>Modo Escuro</Text>
                </View>
                <Switch 
                    accessibilityLabel="Modo escuro"
                    accessibilityHint="Ativa ou desativa o modo escuro."
                    value={isDarkMode} 
                    onValueChange={toggleTheme}
                    trackColor={{ false: "#767577", true: "#BFA2F7" }}
                    thumbColor={isDarkMode ? "#5c27c6" : "#f4f3f4"}
                />
            </View>
        </View>

        {/* SEÇÃO: SUPORTE */}
        <Text style={[styles.secaoTitulo, { color: corSecaoTitulo }]}>SUPORTE</Text>
        <View style={[styles.cardGrupo, { backgroundColor: corCardFundo }]}>
            <TouchableOpacity  accessible accessibilityRole="button" accessibilityLabel="Suporte via WhatsApp" accessibilityHint="Abre uma conversa no WhatsApp."style={styles.linhaOpcao} onPress={whatsapp}>
                <View style={styles.linhaEsquerda}>
                    <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                    <Text style={[styles.opcaoTexto, { color: corTexto }]}>Suporte via WhatsApp</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={corSubtitulo} />
            </TouchableOpacity>
        </View>

        {/* SEÇÃO: AÇÕES */}
        <Text style={[styles.secaoTitulo, { color: corSecaoTitulo }]}>AÇÕES</Text>
        <View style={[styles.cardGrupo, { backgroundColor: corCardFundo }]}>
            <TouchableOpacity accessibilityLabel="Excluir conta" accessibilityHint="Remove permanentemente sua conta."style={styles.linhaOpcao} onPress={confirmarExclusaoConta}>
                <View style={styles.linhaEsquerda}>
                    <Ionicons name="trash-outline" size={22} color="#a90404" />
                    <Text style={[styles.opcaoTexto, { color: "#a90404", fontWeight: "600" }]}>Excluir minha conta</Text>
                </View>
            </TouchableOpacity>
            <View style={[styles.divisor, { backgroundColor: corLinhaDivisoria }]} />
            <TouchableOpacity accessibilityLabel="Sair do aplicativo" accessibilityHint="Encerra sua sessão." style={styles.linhaOpcao} onPress={fazerLogout}>
                <View style={styles.linhaEsquerda}>
                    <Ionicons name="log-out-outline" size={22} color={corTexto} />
                    <Text style={[styles.opcaoTexto, { color: corTexto }]}>Sair do aplicativo</Text>
                </View>
            </TouchableOpacity>
        </View>

        {/* CRÉDITOS E VERSÃO */}
        <View style={styles.footerCreditos}>
            <Text style={[styles.txtVersao, { color: corSubtitulo }]}>Versão 1.0.0</Text>
            <Text style={[styles.txtDesenvolvedor, { color: corSubtitulo }]}>Desenvolvido por Lucas Brasil</Text>
        </View>

    </ScrollView>
</SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: { 
        flex: 1 
    },

    container: { 
        flex: 1, 
        paddingHorizontal: 20 
    },

    contentContainer: { 
        paddingBottom: 120 
    },

    header: { 
        marginTop: 20, 
        marginBottom: 25 
    },

    headerTitle: { 
        fontSize: 24, 
        fontWeight: "bold" 
    },

    secaoTitulo: {
        fontSize: 12, 
        fontWeight: "700", 
        marginLeft: 8, 
        marginBottom: 8, 
        marginTop: 20, 
        letterSpacing: 1 
    },

    cardGrupo: { 
        borderRadius: 16, 
        paddingHorizontal: 16, 
        elevation: 2, 
        shadowColor: "#000",

        shadowOffset: { 
            width: 0, 
            height: 1 
        }, 

        shadowOpacity: 0.1, shadowRadius: 3 
    },

    linhaOpcao: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        paddingVertical: 16 
    },

    linhaEsquerda: { flexDirection: "row", alignItems: "center", gap: 12 },
    opcaoTexto: { fontSize: 16, fontWeight: "500" },
    divisor: { height: 1, width: "100%" },
    footerCreditos: { alignItems: "center", marginTop: 40, gap: 4 },
    txtVersao: { fontSize: 14, fontWeight: "500" },
    txtDesenvolvedor: { fontSize: 12, fontWeight: "400" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center" },
    modalContent: { width: "90%", maxHeight: "80%", borderRadius: 24, padding: 24, elevation: 10 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    modalBody: { marginBottom: 20 },
    lgpdTexto: { fontSize: 14, lineHeight: 22, textAlign: "justify" },
    lgpdDestaque: { fontWeight: "bold" },
    modalBotaoFechar: { backgroundColor: "#5c27c6", padding: 14, borderRadius: 12, alignItems: "center" },
    modalBotaoTexto: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});