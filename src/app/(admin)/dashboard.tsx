import {
    collection,
    onSnapshot
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
    db
} from "../../services/firebaseConfig";

export default function Dashboard() {

    const [consultas, setConsultas] =
        useState<any[]>([]);

    useEffect(() => {

        const unsubscribe = onSnapshot(

            collection(db, "consultas"),

            (snapshot) => {

                const lista: any[] = [];

                snapshot.forEach((doc) => {

                    lista.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setConsultas(lista);
            }
        );

        return () => unsubscribe();

    }, []);

    // =========================
    // ESTATÍSTICAS
    // =========================

    const totalConsultas =
        consultas.length;

    const confirmadas =
        consultas.filter(

            item =>
                item.status === "confirmada"

        ).length;

    const canceladas =
        consultas.filter(

            item =>
                item.status === "cancelada"

        ).length;

    const atendidas =
        consultas.filter(

            item =>
                item.status === "atendido"

        ).length;

    return (

         <>
        <StatusBar style="light" />

        <ScrollView
            contentContainerStyle={
                styles.container
            }
        >

            <Text style={styles.title}>
                Painel Administrativo
            </Text>

            {/* TOTAL */}

            <View style={styles.card}>

                <Text style={styles.number}>
                    {totalConsultas}
                </Text>

                <Text style={styles.label}>
                    Total de Consultas
                </Text>

            </View>

            {/* CONFIRMADAS */}

            <View style={styles.card}>

                <Text style={styles.number}>
                    {confirmadas}
                </Text>

                <Text style={styles.label}>
                    Confirmadas
                </Text>

            </View>

            {/* CANCELADAS */}

            <View style={styles.card}>

                <Text style={styles.number}>
                    {canceladas}
                </Text>

                <Text style={styles.label}>
                    Canceladas
                </Text>

            </View>

            {/* ATENDIDAS */}

            <View style={styles.card}>

                <Text style={styles.number}>
                    {atendidas}
                </Text>

                <Text style={styles.label}>
                    Atendidas
                </Text>

            </View>

        </ScrollView>
     </>    
    );
}

const styles = StyleSheet.create({

    container: {
        padding: 30,
        backgroundColor: "#121212",
        flexGrow: 1,
        justifyContent: "center",
        gap: 20,
    },

    title: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 50,
        textAlign: "center",
        marginTop: 50
    },

    card: {
        backgroundColor: "#1E1E1E",
        padding: 25,
        borderRadius: 20,
    },

    number: {
        color: "#5c27c6",
        fontSize: 32,
        fontWeight: "bold",
    },

    label: {
        color: "#FFF",
        fontSize: 16,
        marginTop: 5,
    },
});