import { StyleSheet } from "react-native";

export const styles = StyleSheet.create(
    {
        main: {
            width: '100%',
            flex: 1,
            flexDirection: "column",
            alignItems: 'center',
            padding: 30,
            backgroundColor: "#fdf9bcff",
            paddingTop: 15
        },
        carregando: {
            width: '100%',
            flex: 1,
            flexDirection: "column",
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
            backgroundColor: "#fdf9bcff",
            paddingTop: 15
        },
        titulo: {
            fontSize: 35,
            color: "red",
            fontWeight: 'bold'
        },
        subtitulo: {
            fontSize: 30,
            fontWeight: '600',
            marginVertical: 10,
            alignSelf: 'center'
        },
        texto: {
            fontSize: 18
        },
        tabelas: {
            width: '100%'
        },
        botaoAdd: {
            width: '50%',
            borderWidth: 2,
            padding: 6,
            borderRadius: 10,
            marginTop: 20,
            alignSelf: "center",
        },
        modalFundo: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 20,
        },
        modalContainer: {
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
        },
        modalTitulo: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center'
        },
        modalInput: {
            borderBottomWidth: 1,
            marginBottom: 15,
            padding: 8,
        },
        modalBotao: {
            backgroundColor: "#ffd768ff",
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10
        },
        botaoCalculadora: {
            width: '95%',
            backgroundColor: "#ff08086c",
            alignItems: 'center',
            justifyContent: 'center',
            height: 50,
            marginTop: 20
        },
        botaoFlutuante: {
            backgroundColor: '#f7c92c',
            borderRadius: 40,
            borderWidth: 2,
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center'
        },
    }
)