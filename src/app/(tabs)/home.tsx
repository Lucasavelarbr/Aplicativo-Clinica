import { Ionicons } from "@expo/vector-icons";
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../services/firebaseConfig";

export default function Home() {
    const { isDarkMode } = useTheme(); 
    const [consultas, setConsultas] = useState<any[]>([]);
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [loadingNome, setLoadingNome] = useState(true);

    async function cancelarConsulta(consultaId: string, idBloqueio: string) {
        if (!idBloqueio) {
            Alert.alert("Erro", "ID de bloqueio não encontrado.");
            return;
        }
        try {
            await deleteDoc(doc(db, "bloqueios", idBloqueio));
            await updateDoc(doc(db, "consultas", consultaId), { status: "cancelada" });
            Alert.alert("Sucesso", "Consulta cancelada e horário liberado!");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível liberar o horário.");
        }
    }

    async function finalizarConsulta(consultaId: string, idBloqueio: string) {
        if (!idBloqueio) {
            Alert.alert("Erro", "ID de bloqueio não encontrado.");
            return;
        }
        try {
            await deleteDoc(doc(db, "bloqueios", idBloqueio));
            await updateDoc(doc(db, "consultas", consultaId), { status: "atendido" });
            Alert.alert("Sucesso", "Atendimento concluído e sala liberada!");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível concluir o atendimento.");
        }
    }

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoadingNome(false);
            return;
        }

        try {
            const userDocRef = doc(db, "usuarios", user.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const dados = docSnap.data();
                    if (dados.nome) setNomeUsuario(dados.nome.split(" ")[0]);
                    if (dados.foto) setFotoPerfil(dados.foto);
                }
            });
            return () => unsubscribeUser();
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingNome(false);
        }
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "consultas"),
            where("userId", "==", user.uid),
            where("status", "==", "confirmada")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista: any[] = [];
            snapshot.forEach((doc) => {
                const dados = doc.data();
                lista.push({ id: doc.id, ...dados, idBloqueio: dados.idBloqueio });
            });
            setConsultas(lista);
        });
        return () => unsubscribe();
    }, []);

    const corFundo = isDarkMode ? "#121212" : "#fff";
    const corTexto = isDarkMode ? "#FFF" : "#000";
    const corSubtitulo = isDarkMode ? "#aaa" : "#666";
    const corCardHistoricoTitulo = isDarkMode ? "#FFF" : "#000";

return (
<SafeAreaView style={[styles.containerPrincipal, { backgroundColor: corFundo }]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
    {/* HEADER */}
    <View style={styles.header}>
        <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
                {fotoPerfil ? (
                    <Image accessibilityLabel="Foto de perfil" source={{ uri: fotoPerfil }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={40} color="#ccc" />
                    </View>
                )}
            </View>
                        
        <View style={styles.caixaNome}
            accessible
            accessibilityLabel={loadingNome ? "Carregando informações do usuário." : `Olá, ${nomeUsuario}. Seja bem-vindo de volta.`}>
            <View style={styles.linhaSaudacao} importantForAccessibility="no-hide-descendants">
                <Text style={[styles.ola, { color: corTexto }]}>Olá, </Text>
                {loadingNome ? (
                    <ActivityIndicator size="small" color="#7B2FF7" style={styles.loader} />
                ) : (
                    <Text style={styles.nome}>{nomeUsuario}</Text>
                )}
            </View>
            <Text style={[styles.subtitulo, { color: corSubtitulo }]} importantForAccessibility="no">Seja bem-vindo de volta</Text>
        </View>
    </View>
</View>

        {/* CONSULTAS AGENDADAS */}
<View style={styles.historicoContainer}>
    <Text accessibilityRole="header" style={[styles.historicoTitulo, { color: corCardHistoricoTitulo }]}>Consultas agendadas</Text>
    {consultas.map((consulta) => (
        <View key={consulta.id} style={[styles.consultaCard, consulta.nomeResponsavel && consulta.nomeResponsavel.trim() !== "" && styles.cardMenorIdade]}>
            <View style={styles.dataBox}>
                <Text style={styles.dia}>{`${consulta.dataConsulta?.split("-")[2]}/${consulta.dataConsulta?.split("-")[1]}`}</Text>
            </View>
            <View style={styles.consultaInfo}>
               
               {/* SALA */}
                <Text accessibilityLabel={`Sala ${consulta.sala}. Horário ${consulta.horario}.`} style={styles.horario}>Sala {consulta.sala} • {consulta.horario}</Text>
                
                {/* PACIENTE */}
                <Text accessibilityLabel={`Paciente ${consulta.nome}`}style={styles.paciente}>{consulta.nome}</Text>
                <Text accessibilityLabel={`Responsável ${consulta.nomeResponsavel}`} style={styles.responsavel}>Resp: {consulta.nomeResponsavel}</Text>
                <Text accessibilityLabel={`Telefone do responsável ${consulta.telefoneResponsavel}`} style={styles.responsavel}>Tel: {consulta.telefoneResponsavel}</Text>
                <Text accessibilityLabel={`Status da consulta: ${consulta.status}`} style={styles.status}>{consulta.status}</Text>
                <TouchableOpacity style={styles.cancelarButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Cancelar consulta de ${consulta.nome}`}
                    accessibilityHint="Cancela esta consulta e libera o horário."
                    onPress={() => cancelarConsulta(
                        consulta.id, 
                        consulta.idBloqueio)}>
                    <Text style={styles.cancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.atendidoButton} 
                    accessibilityRole="button"
                    accessibilityLabel={`Finalizar consulta de ${consulta.nome}`}
                    accessibilityHint="Marca a consulta como atendida."
                    onPress={() => finalizarConsulta(consulta.id, consulta.idBloqueio)}>
                    <Text style={styles.atendidoTexto}>Atendido</Text>
                </TouchableOpacity>
            </View>
        </View>
    ))}
</View>
    </ScrollView>
</SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: { flex: 1 },
    container: { flex: 1 },
    contentContainer: { paddingBottom: 110 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    userInfo: { flexDirection: "row", alignItems: "center", gap: 15, marginTop: 30, marginLeft: 20 },
    avatarContainer: { position: "relative" },
    avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#7B2FF7" },
    avatarPlaceholder: { backgroundColor: "#f0edf5", justifyContent: "center", alignItems: "center" },
    caixaNome: { flexDirection: "column", justifyContent: "center" },
    linhaSaudacao: { flexDirection: "row", alignItems: "center" },
    ola: { fontSize: 22, fontWeight: "400" },
    nome: { color: "#7B2FF7", fontWeight: "bold", fontSize: 22 },
    subtitulo: { fontSize: 14, fontWeight: "400", marginTop: 2 },
    loader: { marginLeft: 5 },
    historicoContainer: { marginTop: 40, paddingHorizontal: 30 },
    historicoTitulo: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    consultaCard: { backgroundColor: "#5c27c6", borderRadius: 20, padding: 18, marginBottom: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    cardMenorIdade: { backgroundColor: "#331f53" },
    horario: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    paciente: { color: "#fff", marginTop: 4 },
    status: { color: "#59f544", fontWeight: "bold" },
    dataBox: { alignItems: "center" },
    dia: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    consultaInfo: { flex: 1, marginLeft: 20 },
    cancelarButton: { marginTop: 12, backgroundColor: "#FFF", paddingVertical: 8, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    cancelarTexto: { color: "red", fontWeight: "bold" },
    responsavel: { color: "#fff", fontWeight: "600", marginTop: 4 },
    atendidoButton: { marginTop: 10, backgroundColor: "#149101", paddingVertical: 8, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    atendidoTexto: { color: "#fff", fontWeight: "bold" },
});