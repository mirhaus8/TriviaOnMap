import { StyleSheet } from "react-native";
import { theme } from "../../../App.style";

export const registerStyle = StyleSheet.create({
    content: {
        padding: 15,
        paddingTop: 0
    },
    icon: {
        color: theme.colors.primary
    },
    button: {
        margin: 15,
        marginLeft: 0,
        marginRight: 0
    },
    picker: {
        marginTop: 10,
        marginBottom: 5,
        flexDirection: "row",
        display: "flex",
        flex: 1,
        color:"#800080",
        backgroundColor: '#E7E3EE'
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 10,
      },
})