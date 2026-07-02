import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View
} from "react-native";

type Props = TouchableOpacityProps &{
    title: string;
};

export function Button({title, ...rest}: Props){
    return(
     <View style={styles.container}>   
        <TouchableOpacity 
        accessibilityRole="button"
        accessibilityLabel="title"
        activeOpacity={0.8}
        style={styles.button}

         {...rest}
        >

        <Text style={styles.tittle}>{title}</Text>

        </TouchableOpacity>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center"
    },

    button: {
        width: "70%",
        height: 50,
        backgroundColor: "#5c27c6",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },

    tittle:{
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold"
    }
})


