import {
    collection,
    getDocs
} from "firebase/firestore";

import {
    useEffect,
    useState
} from "react";

import { StatusBar } from "expo-status-bar";

import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import {
    SafeAreaView
} from "react-native-safe-area-context";

import {
    db
} from "../../services/firebaseConfig";

export default function Alunos() {

    const [usuarios, setUsuarios] =
        useState<any[]>([]);

    useEffect(() => {

        async function carregarDados() {

            // =========================
            // CONSULTAS
            // =========================

            const consultasSnapshot =
                await getDocs(
                    collection(db, "consultas")
                );

            // =========================
            // USUÁRIOS
            // =========================

            const usuariosSnapshot =
                await getDocs(
                    collection(db, "usuarios")
                );

            const consultas =
                consultasSnapshot.docs.map(
                    doc => doc.data()
                );

            // =========================
            // FILTRAR USUÁRIOS
            // =========================

            const usuariosFirebase =
                usuariosSnapshot.docs

                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))

                    // REMOVE ADMIN
                    .filter((usuario: any) =>

                        usuario.role !== "admin"
                    )

                    // REMOVE SEM NOME
                    .filter((usuario: any) =>

                        usuario.nome &&
                        usuario.email
                    )

                    // SOMENTE QUEM POSSUI CONSULTAS
                    .filter((usuario: any) =>

                        consultas.some(

                            (consulta: any) =>

                                consulta.userId === usuario.id
                        )
                    );

            // =========================
            // AGRUPAMENTO
            // =========================

            const listaFinal =
                usuariosFirebase.map((usuario: any) => {

                    const consultasUsuario =
                        consultas.filter(

                            (consulta: any) =>

                                consulta.userId === usuario.id
                        );

                    const atendidas =
                        consultasUsuario.filter(

                            (consulta: any) =>

                                consulta.status === "atendido"
                        ).length;

                    const canceladas =
                        consultasUsuario.filter(

                            (consulta: any) =>

                                consulta.status === "cancelada"
                        ).length;

                    const menores =
                        consultasUsuario.filter(

                            (consulta: any) =>

                                consulta.nomeResponsavel
                        ).length;

                    return {

                        nome:
                            usuario.nome,

                        email:
                            usuario.email,

                        atendidas,

                        canceladas,

                        menores,

                        total:
                            consultasUsuario.length,

                        consultas:
                            consultasUsuario,
                    };
                });

            setUsuarios(listaFinal);
        }

        carregarDados();

    }, []);

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
                    Relatório de Usuários
                </Text>

                {usuarios.map((usuario, index) => (

                    <View
                        key={index}
                        style={styles.card}
                    >

                        {/* NOME */}

                        <Text style={styles.nome}>
                            {usuario.nome}
                        </Text>

                        {/* EMAIL */}

                        <Text style={styles.email}>
                            {usuario.email}
                        </Text>

                        {/* ESTATÍSTICAS */}

                        <Text style={styles.info}>
                            Total: {usuario.total}
                        </Text>

                        <Text style={styles.info}>
                            Atendidas: {usuario.atendidas}
                        </Text>

                        <Text style={styles.info}>
                            Canceladas: {usuario.canceladas}
                        </Text>

                        <Text style={styles.info}>
                            Menores atendidos: {usuario.menores}
                        </Text>

                        {/* CONSULTAS */}

                        {usuario.consultas.map(

                            (consulta: any, indexConsulta: number) => (

                                <View
                                    key={indexConsulta}
                                    style={styles.consultaBox}
                                >

                                    {/* DATA */}

                                    <Text style={styles.consultaText}>
                                        📅 {
                                            consulta.dataConsulta
                                                ?.split("-")
                                                .reverse()
                                                .join("/")
                                        }
                                    </Text>

                                    {/* HORÁRIO */}

                                    <Text style={styles.consultaText}>
                                        🕑 {consulta.horario}
                                    </Text>

                                    {/* SALA */}

                                    <Text style={styles.consultaText}>
                                        🚪 {consulta.sala}
                                    </Text>

                                    {/* RESPONSÁVEL LEGAL */}

                                    {consulta.nomeResponsavel ? (

                                        <View style={styles.responsavelBox}>

                                            <Text style={styles.responsavelTitulo}>
                                                Responsável Legal
                                            </Text>

                                            <Text style={styles.responsavelTexto}>
                                                👤 {consulta.nomeResponsavel}
                                            </Text>

                                            <Text style={styles.responsavelTexto}>
                                                📞 {consulta.telefoneResponsavel}
                                            </Text>

                                        </View>

                                    ) : null}

                                </View>
                            )
                        )}

                    </View>
                ))}

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
        padding: 30,
    },

    title: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 50,
        marginTop: 20,
        textAlign: "center",
    },

    card: {
        backgroundColor: "#1E1E1E",
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },

    nome: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "bold",
    },

    email: {
        color: "#AAA",
        marginTop: 5,
        marginBottom: 15,
    },

    info: {
        color: "#FFF",
        marginTop: 5,
    },

    consultaBox: {
        marginTop: 15,
        backgroundColor: "#2A2A2A",
        padding: 15,
        borderRadius: 12,
    },

    consultaText: {
        color: "#DDD",
        marginTop: 5,
        fontSize: 15,
    },

    responsavelBox: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#ed762b",
        paddingTop: 15,
    },

    responsavelTitulo: {
        color: "#ed762b",
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 10,
    },

    responsavelTexto: {
        color: "#DDD",
        marginTop: 5,
        fontSize: 15,
    },
});