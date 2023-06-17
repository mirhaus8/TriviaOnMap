import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import React from "react";



export const CreateTeam = ({ teams, setVisible, setTeams }) => {
    const [teamName, setTeamName] = React.useState("");

    
    const closeModal = () => setVisible(false);

    
    const handleCreateTeam = () => {
        // socket.emit("createGame", {"gameName":groupName}, (x)=>{
        //     fetchGroups()
        //     //setRooms(x)
        // });
        setTeams([... teams, teamName])
        closeModal();
    };
    return (
        <View style={styles.Container}>
            <Text style={styles.Subheading}>Enter your Team name</Text>
            <TextInput
                style={styles.modalinput}
                placeholder='Team Name'
                onChangeText={(value) => { setTeamName(value)}}
            />

            <View style={styles.ButtonContainer}>
                <Pressable style={styles.Button} onPress={handleCreateTeam}>
                    <Text style={styles.Text}>CREATE</Text>
                </Pressable>
                <Pressable
                    style={[styles.Button, { backgroundColor: "#E14D2A" }]}
                    onPress={closeModal}
                >
                    <Text style={styles.Text}>CANCEL</Text>
                </Pressable>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    Button: {
        width: "40%",
        height: 45,
        backgroundColor: "green",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
    },
    ButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    Text: {
        color: "#fff",
    },
    Container: {
        width: "100%",
        borderTopColor: "#ddd",
        borderTopWidth: 1,
        elevation: 1,
        height: 400,
        backgroundColor: "#fff",
        position: "absolute",
        bottom: 0,
        zIndex: 10,
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    Input: {
        borderWidth: 2,
        padding: 15,
    },
    Subheading: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    }
});