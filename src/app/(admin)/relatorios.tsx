import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

import * as FileSystem from "expo-file-system/legacy";

import { router } from "expo-router";

import {
    collection,
    getDocs
} from "firebase/firestore";

import {
    useEffect,
    useState
} from "react";

import { signOut } from "firebase/auth";

import { StatusBar } from "expo-status-bar";

import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

import {
    SafeAreaView
} from "react-native-safe-area-context";

import {
    auth,
    db
} from "../../services/firebaseConfig";

export default function Relatorios() {

    const [usuarios, setUsuarios] =
        useState<any[]>([]);

    // =========================
    // CARREGAR DADOS
    // =========================

    useEffect(() => {

        async function carregarDados() {

            const consultasSnapshot =
                await getDocs(
                    collection(db, "consultas")
                );

            const usuariosSnapshot =
                await getDocs(
                    collection(db, "usuarios")
                );

            const consultas =
                consultasSnapshot.docs.map(doc => doc.data());

            const usuariosFirebase =
                usuariosSnapshot.docs

                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))

                    .filter((usuario: any) =>
                        usuario.role !== "admin"
                    )

                    .filter((usuario: any) =>
                        usuario.nome &&
                        usuario.email
                    );

            const listaFinal =
                usuariosFirebase.map((usuario: any) => {

                    const consultasUsuario =
                        consultas.filter(

                            (consulta: any) =>

                                consulta.userId === usuario.id
                        );

                    return {

                        nome:
                            usuario.nome,

                        email:
                            usuario.email,

                        total:
                            consultasUsuario.length,

                        atendidas:
                            consultasUsuario.filter(

                                (consulta: any) =>

                                    consulta.status === "atendido"
                            ).length,

                        canceladas:
                            consultasUsuario.filter(

                                (consulta: any) =>

                                    consulta.status === "cancelada"
                            ).length,

                        consultas:
                            consultasUsuario,
                    };
                });

            setUsuarios(listaFinal);
        }

        carregarDados();

    }, []);

    // =========================
    // PDF
    // =========================

    async function gerarPDF() {

        try {

            let html = `

                <h1>
                    Relatório Administrativo
                </h1>

                <hr />
            `;

            usuarios.forEach((usuario) => {

                html += `

                    <h2>
                        ${usuario.nome}
                    </h2>

                    <p>
                        ${usuario.email}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ${usuario.total}
                    </p>

                    <p>
                        <strong>Atendidas:</strong>
                        ${usuario.atendidas}
                    </p>

                    <p>
                        <strong>Canceladas:</strong>
                        ${usuario.canceladas}
                    </p>

                    ${usuario.consultas.map((consulta: any) => `

                        <div style="
                            margin-top:20px;
                            padding:15px;
                            background:#F2F2F2;
                            border-radius:10px;
                        ">

                            <p>
                                <strong>Data:</strong>
                                ${consulta.dataConsulta
                                    ?.split("-")
                                    .reverse()
                                    .join("/")}
                            </p>

                            <p>
                                <strong>Horário:</strong>
                                ${consulta.horario}
                            </p>

                            <p>
                                <strong>Sala:</strong>
                                ${consulta.sala}
                            </p>

                            <p>
                                <strong>Status:</strong>
                                ${consulta.status}
                            </p>

                            ${consulta.nomeResponsavel ? `

                                <p>
                                    <strong>Responsável:</strong>
                                    ${consulta.nomeResponsavel}
                                </p>

                                <p>
                                    <strong>Telefone:</strong>
                                    ${consulta.telefoneResponsavel}
                                </p>

                            ` : ""}

                        </div>

                    `).join("")}

                    <hr />
                `;
            });

            const { uri } =
                await Print.printToFileAsync({

                    html
                });

            await Sharing.shareAsync(uri);

        } catch {

            Alert.alert(
                "Erro",
                "Não foi possível gerar PDF."
            );
        }
    }

    // =========================
    // CSV
    // =========================

    async function gerarCSV() {

        try {

            let csv =

                "Nome,Email,Data,Horario,Sala,Responsavel,TelefoneResponsavel,Status\n";

            usuarios.forEach((usuario) => {

                usuario.consultas.forEach((consulta: any) => {

                    csv +=

                        `${usuario.nome},` +

                        `${usuario.email},` +

                        `${consulta.dataConsulta
                            ?.split("-")
                            .reverse()
                            .join("/") || ""},` +

                        `${consulta.horario || ""},` +

                        `${consulta.sala || ""},` +

                        `${consulta.nomeResponsavel || ""},` +

                        `${consulta.telefoneResponsavel || ""},` +

                        `${consulta.status || ""}\n`;
                });
            });

            // =========================
            // CAMINHO
            // =========================

            const fileUri =

                FileSystem.cacheDirectory +

                "relatorio.csv";

            // =========================
            // ESCREVER
            // =========================

            await FileSystem.writeAsStringAsync(

                fileUri,

                csv
            );

            // =========================
            // COMPARTILHAR
            // =========================

            await Sharing.shareAsync(fileUri);

        } catch {

            Alert.alert(
                "Erro",
                "Não foi possível gerar CSV."
            );
        }
    }

    // =========================
    // LOGOUT
    // =========================

    async function sair() {

        try {

            await signOut(auth);

            router.replace("/login");

        } catch {

            Alert.alert(
                "Erro",
                "Não foi possível sair."
            );
        }
    }

    return (

        <SafeAreaView style={styles.safe}>

            <StatusBar style="light" />

            <ScrollView

                style={styles.container}

                contentContainerStyle={{
                    paddingBottom: 120
                }}
            >

                <Text style={styles.title}>
                    Relatórios
                </Text>

                {/* PDF */}

                <TouchableOpacity

                    style={styles.button}

                    onPress={gerarPDF}
                >

                    <Text style={styles.textButton}>
                        Exportar PDF
                    </Text>

                </TouchableOpacity>

                {/* CSV */}

                <TouchableOpacity

                    style={styles.button}

                    onPress={gerarCSV}
                >

                    <Text style={styles.textButton}>
                        Exportar CSV
                    </Text>

                </TouchableOpacity>

                {/* LOGOUT */}

                <TouchableOpacity

                    style={styles.logout}

                    onPress={sair}
                >

                    <Text style={styles.textButton}>
                        Sair
                    </Text>

                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    safe: {
        flex: 1,
        backgroundColor: "#121212",
    },

    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 20,
    },

    title: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 40,
        textAlign: "center",
    },

    button: {
        backgroundColor: "#5c27c6",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 20,
    },

    logout: {
        backgroundColor: "#C62828",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 40,
    },

    textButton: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});