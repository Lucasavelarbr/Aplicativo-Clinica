import { Redirect, Tabs } from "expo-router";

import {
    Ionicons
} from "@expo/vector-icons";

import {
    doc,
    getDoc
} from "firebase/firestore";

import {
    useEffect,
    useState
} from "react";

import {
    auth,
    db
} from "../../services/firebaseConfig";

export default function AdminLayout() {

    const [isAdmin, setIsAdmin] =
        useState<boolean | null>(null);

    useEffect(() => {

        async function checkAdmin() {

            const user =
                auth.currentUser;

            if (!user) {

                setIsAdmin(false);

                return;
            }

            // =========================
            // BUSCA USUÁRIO
            // =========================

            const userDoc = await getDoc(

                doc(
                    db,
                    "usuarios",
                    user.uid
                )
            );

            const userData =
                userDoc.data();

            setIsAdmin(
                userData?.role === "admin"
            );
        }

        checkAdmin();

    }, []);

    // =========================
    // LOADING
    // =========================

    if (isAdmin === null) {

        return null;
    }

    // =========================
    // BLOQUEIA NÃO ADMIN
    // =========================

    if (!isAdmin) {

        return <Redirect href="/login" />;
    }

    // =========================
    // TABS ADMIN
    // =========================

    return (

        <Tabs

            screenOptions={{

                headerShown: false,

                tabBarStyle: {
                    backgroundColor: "#121212",
                    borderTopWidth: 0,
                    height: 70,
                },

                tabBarActiveTintColor:
                    "#5c27c6",

                tabBarInactiveTintColor:
                    "#999",
            }}
        >

            {/* DASHBOARD */}

            <Tabs.Screen
                name="dashboard"

                options={{

                    title: "Dashboard",

                    tabBarIcon: ({
                        color,
                        size
                    }) => (

                        <Ionicons
                            name="grid"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            {/* CONSULTAS */}

            <Tabs.Screen
                name="consultas"

                options={{

                    title: "Consultas",

                    tabBarIcon: ({
                        color,
                        size
                    }) => (

                        <Ionicons
                            name="calendar"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            {/* ALUNOS */}

            <Tabs.Screen
                name="alunos"

                options={{

                    title: "Alunos",

                    tabBarIcon: ({
                        color,
                        size
                    }) => (

                        <Ionicons
                            name="people"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            {/* RELATÓRIOS */}

            <Tabs.Screen
                name="relatorios"

                options={{

                    title: "Relatórios",

                    tabBarIcon: ({
                        color,
                        size
                    }) => (

                        <Ionicons
                            name="document-text"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}