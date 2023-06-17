import React from "react";
import { View, Text, Pressable, SafeAreaView, FlatList, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {Group} from "../../components/Group";
import {CreateGroup} from "./../../components/CreateGroup";
import socket from "../../../utils/socketio";

export const TeamSelection = (props) => {

    const rooms = [
        {
            id: "1",
            name: "Novu Hangouts",
            messages: [
                {
                    id: "1a",
                    text: "Hello guys, welcome!",
                    time: "07:50",
                    user: "Tomer",
                },
                {
                    id: "1b",
                    text: "Hi Tomer, thank you! 😇",
                    time: "08:50",
                    user: "David",
                },
            ],
        },
        {
            id: "2",
            name: "Hacksquad Team 1",
            messages: [
                {
                    id: "2a",
                    text: "Guys, who's awake? 🙏🏽",
                    time: "12:50",
                    user: "Team Leader",
                },
                {
                    id: "2b",
                    text: "What's up? 🧑🏻‍💻",
                    time: "03:50",
                    user: "Victoria",
                },
            ],
        },
    ];
    
    


    // const [rooms, setRooms] = useState([]);

    // React.useLayoutEffect(() => {
    //     function fetchGroups() {
    //         fetch("http://localhost:4000/api")
    //             .then((res) => res.json())
    //             .then((data) => setRooms(data))
    //             .catch((err) => console.error(err));
    //     }
    //     fetchGroups();
    // }, []);

    //👇🏻 Runs whenever there is new trigger from the backend
    // React.useEffect(() => {
    //     socket.on("roomsList", (rooms2) => {
    //         // setRooms(rooms);
    //         console.log(rooms2)
    //     });
    // }, [socket]);

    return (
        <SafeAreaView style={styles.chatScreen}>
            <View style={Styles.content}>

                <View style={Styles.listItem}>
                    <Icon name="earth" />
                    <AppText style={Styles.text}> Select Origin Country</AppText>


                </View>
                <CountryPicker selectedItem={handleSelection} />
            </View>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    chatScreen: {
        backgroundColor: "#F7F7F7",
        flex: 1,
        padding: 10,
        position: "relative"
    },
    chatTopContainer: {
        backgroundColor: "#F7F7F7",
        height: 70,
        width: "100%",
        padding: 20,
        justifyContent: "center",
        marginBottom: 15,
        elevation: 2
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        
    },
    chatHeading: {
        fontSize: 24,
        fontWeight: "bold",
        color: "green"
    },
    chatListContainer:{
        paddingHorizontal: 10,
    },
    chatEmptyContainer: {
        width: "100%",
        height: "80%",
        alignItems: "center",
        justifyContent: "center"
    },
    chatEmptyText:{
        fontWeight: "bold",
        fontSize: 24,
        paddingBottom: 30
    }
});