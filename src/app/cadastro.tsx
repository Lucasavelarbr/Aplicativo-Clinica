import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { Button } from "../components/Button";
import { Input } from "../components/Input";

import { useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export default function Cadastro(){

const [nome, setNome] = useState("");
const [cpf, setCpf] = useState("");
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [confirmarSenha, setConfirmarSenha] = useState("");
const [loading, setLoading] = useState(false);
const [erro, setErro] = useState("");

function mascaraCpf(texto: string){

    let valor = texto.replace(/\D/g, "");

    if(valor.length > 11){
        valor = valor.slice(0, 11);
    }

    valor = valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
    );

    valor = valor.replace(
        /(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3"
    );

    valor = valor.replace(
        /(\d{3})\.(\d{3})\.(\d{3})(\d)/,
        "$1.$2.$3-$4"
    );

    setCpf(valor);
}

async function cadastrar(){

    setErro("")

    if(!nome){
        setErro("Preencha o nome completo");
        return;
    }

     if(!email){
        setErro("Preencha um e-mail válido");
        return;
    }

     if(!cpf){
        setErro("Preencha o campo CPF");
        return;
    }

     if(!senha){
        setErro("Preencha o campo Senha");
        return;
    }

     if(!confirmarSenha){
        setErro("Confirme sua senha");
        return;
    }

    if(senha !== confirmarSenha){
        setErro("As senhas não coincidem")
        return;
    }

     try{

            setLoading(true);

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    userCredential.user.uid
                ),
                {
                    nome,
                    cpf,
                    email,
                    criadoEm: new Date()
                }
            );

            setErro("Conta criada com sucesso!");

            router.push("/login");

        }catch(error: any){

            console.log(error);

            setErro(error.message);

        }finally{

            setLoading(false);
        }
    }




    return(
<SafeAreaView style={{ flex: 1, backgroundColor: "#fff"}}>
 <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <ScrollView
        contentContainerStyle={{ 
            paddingBottom: 50
         }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >  

        <View style={styles.container}>
            <Text style={styles.tittle}>Criar conta</Text>
            <Text style={styles.subTittle}>Insira os dados abaixo:</Text>

            <View style={styles.inputs}>
                <Input 
                    label="Nome completo"
                    placeholder="Digite seu nome"
                    value={nome}
                    onChangeText={setNome}
                />
        
                <Input 
                    label="CPF"
                    placeholder="000.000.000-00"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numeric"
                    value={cpf}
                    onChangeText={mascaraCpf}
                />
        
                <Input 
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                />

                <Input 
                    label="Senha"
                    placeholder="Senha"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={senha}
                    onChangeText={setSenha}
                />

                <Input 
                    label="Confirme sua senha"
                    placeholder="Confirme sua senha"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                />
            </View>

            <View style={styles.buttonCont}>
                <Button 
                    title={
                        loading ? "Carregando" : "Cadastrar"
                    }

                    onPress={cadastrar}
                />
            </View>   
            
            {erro !== "" && (
                <Text style={styles.erro}>{erro}</Text>
                )
            }


            <View style={styles.conta}>
                <Link href="/login">
                    <Text style={styles.textoConta}>Já possui conta?</Text>
                </Link>    
                
            </View>  
        </View> 
    </ScrollView> 
</KeyboardAvoidingView>
</SafeAreaView>     
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 40,
        paddingTop: 30
    },

    tittle:{
        fontSize: 40,
        fontWeight: "bold",
        color: "#000",
        justifyContent: "flex-start"
    },

    subTittle: {
        color: "#000",
        fontSize: 15,
        marginTop: 5
    },

    inputs: {
        gap: 20,
        marginTop: 40
    },

    buttonCont:{
        marginTop: 35
    },

    conta: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30
    },

    textoConta:{
        color: "#551fc1",
        fontSize: 18,
        fontWeight: "bold"
    },
    
    erro:{
        color: "red",
        fontSize: 16,
        marginTop: 15,
        textAlign: "center"
    }
})