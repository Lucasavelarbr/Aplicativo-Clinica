import { Link, router } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";

export default function Login() {
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    async function entrar() {
        setErro("");
        if (!email.trim() || !senha.trim()) {
            setErro("Preencha e-mail e senha");
            return;
        }
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);
            
            // Busca o documento do usuário para verificar o cargo
            const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
            const userData = userDoc.data();

            if (userData?.role === "admin") {
                router.replace("/(admin)/dashboard");
            } else {
                router.replace("/(tabs)/home");
            }
        } catch (error) {
            setErro("E-mail ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    }

    async function recuperarSenha() {
        setErro("");
        if (!email.trim()) {
            setErro("Digite seu e-mail acima para recuperar a senha.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setErro("E-mail de recuperação enviado!");
        } catch (error) {
            setErro("Não foi possível enviar o e-mail.");
        }
    }

    const corFundo = isDarkMode ? "#121212" : "#fff";
    const corTexto = isDarkMode ? "#fff" : "#000";

    return (
        <View style={[styles.container, { backgroundColor: corFundo }]}>
            <Text style={[styles.tittle, { color: corTexto }]}>Bem Vindo(a)</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? "#bbb" : "#000" }]}>
                Entre com sua conta para continuar.
            </Text>

            <View style={styles.inputCont}>
                <Input label="E-mail" placeholder="Digite seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <Input label="Senha" placeholder="Digite sua senha" secureTextEntry={true} value={senha} onChangeText={setSenha} autoCapitalize="none" />
                
                <TouchableOpacity onPress={recuperarSenha} style={styles.forgotPass}>
                    <Text style={styles.textoCriar}>Esqueci minha senha</Text>
                </TouchableOpacity>

                {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

                <View style={styles.button}>
                    <Button title={loading ? "Carregando..." : "Entrar"} onPress={entrar} disabled={loading} />
                </View>

                <View style={styles.dividerContainer}>
                    <View style={[styles.line, { backgroundColor: isDarkMode ? "#333" : "#252525" }]} />
                    <Text style={styles.or}>ou</Text>
                    <View style={[styles.line, { backgroundColor: isDarkMode ? "#333" : "#252525" }]} />
                </View>

                <View style={styles.criar}>
                    <Link href="/cadastro">
                        <Text style={styles.textoCriar}>Criar conta!</Text>
                    </Link>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30 },
    tittle: { fontSize: 32, fontWeight: "700", paddingTop: 100 },
    subtitle: { marginTop: 10, fontSize: 18 },
    inputCont: { width: "100%", marginTop: 50, gap: 20 },
    button: { marginTop: 10 },
    forgotPass: { alignSelf: "center", marginTop: 5 },
    dividerContainer: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 15 },
    or: { color: "#551fc1", fontSize: 15, fontWeight: "300" },
    line: { flex: 1, height: 1 },
    criar: { justifyContent: "center", alignItems: "center", marginTop: 5 },
    textoCriar: { color: "#551fc1", fontSize: 16, fontWeight: "500", textDecorationLine: "underline" },
    erro: { color: "#D32F2F", fontSize: 14, fontWeight: "500", marginTop: 5, textAlign: "center" },
});