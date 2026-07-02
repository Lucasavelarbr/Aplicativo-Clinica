import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { addDoc, collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/Input";
import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../services/firebaseConfig";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function Agendar() {
    const { isDarkMode } = useTheme();
    const hoje = new Date().toISOString().split("T")[0];

    const [sexo, setSexo] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [cpf, setCpf] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeResponsavel, setNomeResponsavel] = useState("");
    const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
    const [selectedDate, setSelectedDate] = useState(hoje);
    const [salaSelecionada, setSalaSelecionada] = useState("");
    const [horarioSelecionado, setHorarioSelecionado] = useState("");
    const [consultas, setConsultas] = useState<any[]>([]);
    const [loadingConsultas, setLoadingConsultas] = useState(true);

    const todasSalas = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
    const todosHorarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");

    // RESETAR FORMULÁRIO
    function limparFormulario() {
        setNome("");
        setTelefone("");
        setEmail("");
        setCpf("");
        setSexo("");
        setDataNascimento("");
        setNomeResponsavel("");
        setTelefoneResponsavel("");
        setSalaSelecionada("");
        setHorarioSelecionado("");
        setSelectedDate(hoje);
        setModalVisible(false);
    }

    // CORREÇÃO DO BOTÃO
    const formularioCompleto = useMemo(() => {
        return !!(
            nome.trim() &&
            cpf.trim() &&
            telefone.trim() &&
            email.trim() &&
            dataNascimento.trim() &&
            selectedDate.trim() &&
            salaSelecionada.trim() &&
            horarioSelecionado.trim()
        );
    }, [
        nome,
        cpf,
        telefone,
        email,
        dataNascimento,
        selectedDate,
        salaSelecionada,
        horarioSelecionado
    ]);

    const estaPassado = (horario: string) => {
        if (selectedDate !== hoje) return false;
        const horaAtual = new Date().getHours();
        const horaHorario = parseInt(horario.split(":")[0]);
        return horaHorario <= horaAtual;
    };

    useEffect(() => {
        const q = query(collection(db, "bloqueios"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lista: any[] = [];

            snapshot.forEach((doc) => {
                lista.push(doc.data());
            });

            setConsultas(lista);
            setLoadingConsultas(false);
        });

        return () => unsubscribe();
    }, []);

    function mascaraTelefone(texto: string, tipo: "paciente" | "responsavel") {
        let valor = texto.replace(/\D/g, "");

        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

        if (tipo === "paciente") {
            setTelefone(valor);
        } else {
            setTelefoneResponsavel(valor);
        }
    }

    function verificarIdade(texto: string) {
        setDataNascimento(texto);

        const ano = Number(texto.split("/")[2]);

        if (!ano || texto.length < 10) return;

        if ((new Date().getFullYear() - ano) < 18) {
            setModalVisible(true);
        } else {
            setNomeResponsavel("");
            setTelefoneResponsavel("");
        }
    }

    function mascaraData(texto: string) {
        let valor = texto.replace(/\D/g, "");

        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        valor = valor.replace(/(\d{2})(\d)/, "$1/$2");
        valor = valor.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");

        verificarIdade(valor);
    }

    function mascaraCpf(texto: string) {
        let valor = texto.replace(/\D/g, "");

        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        valor = valor.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

        setCpf(valor);
    }

    async function agendarConsulta() {
        if (!formularioCompleto) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        try {
            const bloqueioRef = await addDoc(collection(db, "bloqueios"), {
                sala: salaSelecionada,
                horario: horarioSelecionado,
                dataConsulta: selectedDate
            });

            await addDoc(collection(db, "consultas"), {
                nome,
                cpf: cpf.replace(/\D/g, ""),
                telefone,
                email,
                userId: auth.currentUser?.uid,
                sexo,
                dataNascimento,
                nomeResponsavel,
                telefoneResponsavel,
                dataConsulta: selectedDate,
                horario: horarioSelecionado,
                sala: salaSelecionada,
                status: "confirmada",
                criadoEm: new Date(),
                idBloqueio: bloqueioRef.id
            });

            Alert.alert("Sucesso", "Consulta agendada!");

            // LIMPA O FORMULÁRIO
            limparFormulario();

            router.push("/(tabs)/home");

        } catch (error) {
            Alert.alert("Erro", "Erro ao realizar agendamento.");
        }
    }

    const corFundo = isDarkMode ? "#121212" : "#FFF";
    const corTexto = isDarkMode ? "#FFF" : "#000";
    const corModalFundo = isDarkMode ? "#1E1E1E" : "#FFF";

    const modalCompleto =
        nomeResponsavel.trim() &&
        telefoneResponsavel.trim();

    return (
        <SafeAreaView
            style={[
                styles.containerPrincipal,
                { backgroundColor: corFundo }
            ]}
        >
            <StatusBar
                style={isDarkMode ? "light" : "dark"}
                backgroundColor={corFundo}
                translucent={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            { backgroundColor: corModalFundo }
                        ]}
                    >
                        <Text style={styles.modalTitle}>
                            Paciente Menor de Idade
                        </Text>

                        <Input
                            label="Nome do Responsável"
                            placeholder="Digite o nome completo"
                            value={nomeResponsavel}
                            onChangeText={setNomeResponsavel}
                        />

                        <Input
                            label="Telefone do Responsável"
                            placeholder="(11) 99999-9999"
                            value={telefoneResponsavel}
                            onChangeText={(text) =>
                                mascaraTelefone(text, "responsavel")
                            }
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            disabled={!modalCompleto}
                            style={[
                                styles.modalButton,
                                !modalCompleto && { opacity: 0.5 }
                            ]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>
                                Confirmar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView
                style={styles.containerScroll}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>

                    {/* RESETA AO VOLTAR */}
                    <TouchableOpacity
                        onPress={() => {
                            limparFormulario();
                            router.back();
                        }}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={28}
                            color="#5c27c6"
                        />
                    </TouchableOpacity>

                </View>

                <Text
                    style={[
                        styles.titulo,
                        { color: corTexto }
                    ]}
                >
                    Agendar consulta
                </Text>

                <View style={styles.form}>
                    <Input
                        label="Nome completo"
                        placeholder="Digite seu nome"
                        value={nome}
                        onChangeText={setNome}
                    />

                    <Input
                        label="Data de nascimento"
                        placeholder="DD/MM/AAAA"
                        value={dataNascimento}
                        onChangeText={mascaraData}
                        keyboardType="numeric"
                    />

                    <Input
                        label="CPF"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChangeText={mascaraCpf}
                        keyboardType="numeric"
                    />

                    <Input
                        label="Telefone"
                        placeholder="(11) 99999-9999"
                        value={telefone}
                        onChangeText={(text) =>
                            mascaraTelefone(text, "paciente")
                        }
                        keyboardType="numeric"
                    />

                    <Input
                        label="E-mail"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.calendarContainer}>
                    <Text style={styles.calendarTitle}>
                        Escolha a data
                    </Text>

                    <Calendar
                        key={isDarkMode ? "dark" : "light"}
                        minDate={hoje}
                        current={selectedDate}
                        onDayPress={(day) =>
                            setSelectedDate(day.dateString)
                        }
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: "#5c27c6"
                            }
                        }}
                        theme={{
                            backgroundColor: isDarkMode
                                ? "#121212"
                                : "#FFFFFF",

                            calendarBackground: isDarkMode
                                ? "#1E1E1E"
                                : "#FFFFFF",

                            textSectionTitleColor: isDarkMode
                                ? "#b6c1cd"
                                : "#2d4150",

                            selectedDayBackgroundColor: "#5c27c6",
                            selectedDayTextColor: "#ffffff",
                            todayTextColor: "#5c27c6",

                            dayTextColor: isDarkMode
                                ? "#ffffff"
                                : "#2d4150",

                            textDisabledColor: isDarkMode
                                ? "#444444"
                                : "#d9e1e8",

                            monthTextColor: isDarkMode
                                ? "#ffffff"
                                : "#2d4150",

                            arrowColor: "#5c27c6",
                        }}
                    />
                </View>

                {loadingConsultas ? (
                    <Text style={styles.txtLoading}>
                        Carregando...
                    </Text>
                ) : (
                    <>
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Selecione a sala
                            </Text>

                            <View style={styles.optionsContainer}>
                                {todasSalas.map((sala) => {
                                    const salaLotada =
                                        consultas.filter(
                                            (b) =>
                                                b.sala === sala &&
                                                b.dataConsulta === selectedDate
                                        ).length >= todosHorarios.length;

                                    return (
                                        <TouchableOpacity
                                            key={sala}
                                            disabled={salaLotada}
                                            style={[
                                                styles.optionButton,
                                                salaSelecionada === sala &&
                                                styles.optionAtiva,

                                                salaLotada && {
                                                    backgroundColor: isDarkMode
                                                        ? "#2D2D2D"
                                                        : "#EAEAEA",

                                                    borderColor: isDarkMode
                                                        ? "#444"
                                                        : "#ccc",

                                                    opacity: 0.8
                                                }
                                            ]}
                                            onPress={() =>
                                                setSalaSelecionada(sala)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    salaSelecionada === sala && {
                                                        color: "#FFF"
                                                    }
                                                ]}
                                            >
                                                {sala}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {salaSelecionada && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>
                                    Escolha o horário
                                </Text>

                                <View style={styles.optionsContainer}>
                                    {todosHorarios.map((horario) => {
                                        const ocupado =
                                            consultas.some(
                                                (b) =>
                                                    b.horario === horario &&
                                                    b.sala === salaSelecionada &&
                                                    b.dataConsulta === selectedDate
                                            ) ||
                                            estaPassado(horario);

                                        return (
                                            <TouchableOpacity
                                                key={horario}
                                                disabled={ocupado}
                                                style={[
                                                    styles.optionButton,

                                                    horarioSelecionado === horario &&
                                                    styles.optionAtiva,

                                                    ocupado && {
                                                        backgroundColor: isDarkMode
                                                            ? "#2D2D2D"
                                                            : "#EAEAEA",

                                                        borderColor: isDarkMode
                                                            ? "#444"
                                                            : "#ccc",

                                                        opacity: 0.8
                                                    }
                                                ]}
                                                onPress={() =>
                                                    setHorarioSelecionado(horario)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,

                                                        horarioSelecionado === horario && {
                                                            color: "#FFF"
                                                        },

                                                        ocupado && {
                                                            color: isDarkMode
                                                                ? "#888"
                                                                : "#aaa"
                                                        }
                                                    ]}
                                                >
                                                    {horario}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </>
                )}

                <TouchableOpacity
                    disabled={!formularioCompleto}
                    style={[
                        styles.confirmarButton,
                        !formularioCompleto && {
                            opacity: 0.3
                        }
                    ]}
                    onPress={agendarConsulta}
                >
                    <Text style={styles.confirmarTexto}>
                        Confirmar agendamento
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerPrincipal: {
        flex: 1
    },

    containerScroll: {
        flex: 1,
        paddingHorizontal: 10
    },

    contentContainer: {
        paddingBottom: 120
    },

    header: {
        marginTop: 20
    },

    titulo: {
        fontSize: 20,
        marginTop: 50,
        fontWeight: "500",
        marginLeft: 10
    },

    form: {
        padding: 20,
        gap: 30
    },

    calendarContainer: {
        marginTop: 20,
        paddingHorizontal: 20
    },

    calendarTitle: {
        color: "#5c27c6",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 15
    },

    sectionContainer: {
        marginTop: 30,
        paddingHorizontal: 20
    },

    sectionTitle: {
        color: "#5c27c6",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 15
    },

    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10
    },

    optionButton: {
        borderWidth: 1,
        borderColor: "#5c27c6",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18
    },

    optionAtiva: {
        backgroundColor: "#5c27c6"
    },

    optionText: {
        color: "#5c27c6",
        fontWeight: "600"
    },

    txtLoading: {
        textAlign: "center",
        marginTop: 30,
        color: "#5c27c6"
    },

    confirmarButton: {
        backgroundColor: "#5c27c6",
        marginHorizontal: 20,
        padding: 18,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40
    },

    confirmarTexto: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center"
    },

    modalContent: {
        width: "85%",
        borderRadius: 20,
        padding: 25,
        alignItems: "center"
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#a90404",
        marginBottom: 10
    },

    modalButton: {
        backgroundColor: "#5c27c6",
        width: "100%",
        padding: 15,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },

    modalButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16
    }
});