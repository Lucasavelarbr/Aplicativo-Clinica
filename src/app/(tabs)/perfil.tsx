import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { updatePassword } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/Input";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../services/firebaseConfig";

export default function Perfil() {
    const { isDarkMode } = useTheme();
    const user = auth.currentUser;

    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

    const [modalTelefoneVisible, setModalTelefoneVisible] = useState(false);
    const [modalSenhaVisible, setModalSenhaVisible] = useState(false);

    const [novoTelefone, setNovoTelefone] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

    const [atendidosCount, setAtendidosCount] = useState(0);
    const [canceladosCount, setCanceladosCount] = useState(0);

    function aplicarMascaraTelefone(texto: string, tipo: "perfil" | "modal") {
        let valor = texto.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.slice(0, 11);
        valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        if (tipo === "perfil") setTelefone(valor);
        else setNovoTelefone(valor);
    }

    async function escolherFoto() {
        if (!user) return;
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
            return;
        }
        const resultado = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.5 
        });
        if (!resultado.canceled && resultado.assets[0].uri) {
            const uriSelecionada = resultado.assets[0].uri;
            try {
                setFotoPerfil(uriSelecionada);
                await updateDoc(doc(db, "usuarios", user.uid), { foto: uriSelecionada });
                Alert.alert("Sucesso", "Foto de perfil atualizada!");
            } catch (error) {
                Alert.alert("Erro", "Não foi possível salvar sua foto.");
            }
        }
    }

    useEffect(() => {
        async function carregarDadosPerfil() {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                if (userDoc.exists()) {
                    const dados = userDoc.data();
                    setNome(dados.nome || "");
                    setEmail(user.email || ""); 
                    if (dados.telefone) aplicarMascaraTelefone(dados.telefone, "perfil");
                    if (dados.foto) setFotoPerfil(dados.foto);
                }
            } catch (error) {
                console.log(error);
            } finally { 
                setLoading(false); 
            }
        }
        carregarDadosPerfil();
    }, [user]);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const unsubA = onSnapshot(query(collection(db, "consultas"), where("userId", "==", currentUser.uid), where("status", "==", "atendido")), (snap) => setAtendidosCount(snap.size));
        const unsubC = onSnapshot(query(collection(db, "consultas"), where("userId", "==", currentUser.uid), where("status", "==", "cancelada")), (snap) => setCanceladosCount(snap.size));
        return () => { unsubA(); unsubC(); };
    }, [user]);

    async function salvarTelefone() {
        if (!user) return;
        if (!novoTelefone.trim() || novoTelefone.length < 14) { Alert.alert("Atenção", "Digite um telefone válido."); return; }
        try {
            await updateDoc(doc(db, "usuarios", user.uid), { telefone: novoTelefone.replace(/\D/g, "") });
            setTelefone(novoTelefone); setModalTelefoneVisible(false); setNovoTelefone("");
            Alert.alert("Sucesso", "Telefone atualizado!");
        } catch (error) { Alert.alert("Erro", "Não foi possível atualizar o telefone."); }
    }

    async function salvarSenha() {
        if (!user) return;
        if (novaSenha.length < 6) { Alert.alert("Atenção", "Mínimo 6 caracteres."); return; }
        if (novaSenha !== confirmarNovaSenha) { Alert.alert("Atenção", "As senhas não conferem."); return; }
        try {
            await updatePassword(user, novaSenha); setModalSenhaVisible(false); setNovaSenha(""); setConfirmarNovaSenha("");
            Alert.alert("Sucesso", "Senha updated com sucesso!");
        } catch (error) { Alert.alert("Erro", "Faça login novamente e tente a alteração."); }
    }

    const corFundo = isDarkMode ? "#121212" : "#FFF";
    const corTexto = isDarkMode ? "#FFF" : "#000";
    const corModalFundo = isDarkMode ? "#1E1E1E" : "#FFF";

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: corFundo }]}>
                <ActivityIndicator size="large" color="#5c27c6" />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.containerPrincipal, { backgroundColor: corFundo }]}>
            
            {/* MODAL TELEFONE */}
            <Modal animationType="slide" transparent={true} visible={modalTelefoneVisible}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: corModalFundo }]}>
                        <Text style={styles.modalTitle}>Alterar Telefone</Text>
                        <View style={styles.modalForm}>
                            <Input label="Novo Telefone" placeholder="(00) 90000-0000" value={novoTelefone} onChangeText={(text) => aplicarMascaraTelefone(text, "modal")} keyboardType="numeric" />
                        </View>
                        <View style={styles.modalBotoes}>
                            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalTelefoneVisible(false)}><Text style={styles.txtCancelar}>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.btnConfirmar} onPress={salvarTelefone}><Text style={styles.txtConfirmar}>Salvar</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL SENHA */}
            <Modal animationType="slide" transparent={true} visible={modalSenhaVisible}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: corModalFundo }]}>
                        <Text style={styles.modalTitle}>Alterar Senha</Text>
                        <View style={styles.modalForm}>
                            <Input label="Nova Senha" placeholder="Mínimo 6 caracteres" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry={true} />
                            <Input label="Confirmar Nova Senha" placeholder="Repita a nova senha" value={confirmarNovaSenha} onChangeText={setConfirmarNovaSenha} secureTextEntry={true} />
                        </View>
                        <View style={styles.modalBotoes}>
                            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalSenhaVisible(false)}><Text style={styles.txtCancelar}>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.btnConfirmar} onPress={salvarSenha}><Text style={styles.txtConfirmar}>Salvar</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView style={[styles.container, { backgroundColor: corFundo }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/home")}><Ionicons name="arrow-back" size={28} color="#5c27c6" /></TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: corTexto }]}>Meu Perfil</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* AVATAR */}
                <View style={styles.avatarSelecContainer}>
                    <View style={styles.avatarWrapper}>
                        {fotoPerfil ? (
                            <Image source={{ uri: fotoPerfil }} style={styles.perfilAvatar} />
                        ) : (
                            <View style={[styles.perfilAvatar, styles.avatarPlaceholder]}><Ionicons name="person" size={50} color="#ccc" /></View>
                        )}
                        <TouchableOpacity style={styles.perfilBotaoCamera} onPress={escolherFoto}><Ionicons name="camera" size={18} color="#FFF" /></TouchableOpacity>
                    </View>
                </View>

                {/* CARDS INDICADORES */}
                <View style={styles.cardsContainer}>
                    <View style={[styles.card, styles.cardConcluido]}><Ionicons name="checkmark-circle-outline" size={32} color="#fff" /><Text style={styles.cardNumero}>{atendidosCount}</Text><Text style={styles.cardLabel}>Concluídos</Text></View>
                    <View style={[styles.card, styles.cardCancelado]}><Ionicons name="close-circle-outline" size={32} color="#fff" /><Text style={styles.cardNumero}>{canceladosCount}</Text><Text style={styles.cardLabel}>Cancelados</Text></View>
                </View>

                {/* FORMULÁRIO */}
                <View style={styles.form}>
                    <Input label="Nome Completo" value={nome} editable={false} />
                    <Input label="E-mail" value={email} editable={false} />
                    <View style={styles.inputContainerEdicao}>
                        <View style={{ flex: 1 }}><Input label="Telefone" value={telefone} editable={false} /></View>
                        <TouchableOpacity style={styles.btnEditarInput} onPress={() => setModalTelefoneVisible(true)}><Ionicons name="create-outline" size={24} color="#5c27c6" /></TouchableOpacity>
                    </View>
                    <View style={styles.inputContainerEdicao}>
                        <View style={{ flex: 1 }}><Input label="Senha" value="••••••••" editable={false} secureTextEntry={true} /></View>
                        <TouchableOpacity style={styles.btnEditarInput} onPress={() => setModalSenhaVisible(true)}><Ionicons name="create-outline" size={24} color="#5c27c6" /></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingBottom: 120, // Garante espaçamento para a Tabsbar
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#5c27c6",
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    avatarSelecContainer: {
        alignItems: "center",
        marginBottom: 25,
    },
    avatarWrapper: {
        position: "relative",
    },
    perfilAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: "#5c27c6",
    },
    avatarPlaceholder: {
        backgroundColor: "#f0edf5",
        justifyContent: "center",
        alignItems: "center",
    },
    perfilBotaoCamera: {
        position: "absolute",
        bottom: 2,
        right: 2,
        backgroundColor: "#5c27c6",
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    cardsContainer: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 30,
    },
    card: {
        flex: 1,
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardConcluido: {
        backgroundColor: "#073a00",
    },
    cardCancelado: {
        backgroundColor: "#a90404",
    },
    cardNumero: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 5,
    },
    cardLabel: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "600",
        marginTop: 2,
    },
    form: {
        gap: 20,
        paddingBottom: 40,
    },
    inputContainerEdicao: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
    },
    btnEditarInput: {
        // backgroundColor removido para fundo transparente
        height: 50,
        width: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#5c27c6",
        marginBottom: 20,
    },
    modalForm: {
        width: "100%",
        gap: 15,
        marginBottom: 25,
    },
    modalBotoes: {
        flexDirection: "row",
        gap: 15,
        width: "100%",
    },
    btnCancelar: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#a90404",
        padding: 15,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    txtCancelar: {
        color: "#a90404",
        fontWeight: "bold",
    },
    btnConfirmar: {
        flex: 1,
        backgroundColor: "#5c27c6",
        padding: 15,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    txtConfirmar: {
        color: "#FFF",
        fontWeight: "bold",
    },
});