import { StyleSheet } from "react-native";

export const loginStyle = StyleSheet.create({
    content: {
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        //backgroundColor: "#008000"
    },
    view: {
        width: "80%",
        
    },
    cardTitle: {
        color: "#311f13"
    },
    cardButton: {
        margin: 2,
        marginLeft: 0,
        marginRight: 0,
        
    },
    icon: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF6666',
        borderRadius: 50,
        width: '100%',
    },
    btn: {
        borderRadius: 32,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        alignSelf: 'stretch',
        backgroundColor: '#4CB748',
        marginTop: 16,
        minWidth: '50%',
        paddingHorizontal: 16,
      },
})