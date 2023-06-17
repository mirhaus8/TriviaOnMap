import React from "react";
import { View, Text, Pressable, SafeAreaView, FlatList, StyleSheet, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Group } from "../../components/Group";
import { CreateGroup } from "./../../components/CreateGroup";
import socket from "../../../utils/socketio";
import Icon from './../../components/Icon';
import AppText from "../../components/AppText";
import CountryPicker from 'rn-country-dropdown-picker';
const axios = require('axios');
import { Button } from "react-native-paper";
import {Group2} from "../../components/Group2";



export const CreateTeams = (props) => {

    const [rooms, setRooms] = React.useState([]);
    const [originCountry, setOriginCountry] = React.useState("");
    const [visible, setVisible] = React.useState(false);
    const [countryVisible, setCountryVisible] = React.useState(false);
    const [group, setGroup] = React.useState("");
    const onToggleCountry = (country) => {
        socket.emit("createTeam", { "gameName": group, "originCountry": country["country"], "username": props.username });
        //setVisible(false)
        setCountryVisible(false)
    };
    const play = () => props.navigation.navigate("Map2", { username: props.username, gameName: group, originCountry: originCountry });
    function handleSelection(country) {
       // console.log(country);
        setOriginCountry(country["country"]),
            onToggleCountry(country);
    }

    //const createTeams = () => props.navigate.navigate("Group2")


    const fetchGroups = async () => {
        let options = {
            method: 'GET',
            url: "http://10.0.0.8:3001/games",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            }
        };
        let response = await axios(options);

        let responseOK = response && response.status === 200;
        if (responseOK) {
            setRooms(response.data)
        }

    };
    React.useLayoutEffect(() => {
        fetchGroups();
        socket.on("gamesList", (rooms2) => {
            setRooms(rooms2);
        });
    }, [socket]);


    React.useEffect(() => {
        socket.on("gamesList", (rooms2) => {
            setRooms(rooms2);
            fetchGroups();
        });

    }, [socket]);

    return (
        <SafeAreaView style={styles.chatScreen}>

            <View style={styles.chatTopContainer}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatHeading}>Group Selection</Text>

                    <Pressable onPress={() => setVisible(true)}>
                        <Feather name='edit' size={24} color='green' />
                    </Pressable>
                </View>
            </View>

            <View style={styles.chatListContainer}>
                {rooms.length > 0 ? (

                    <FlatList
                        data={rooms}
                        renderItem={({ item }) => <Group2 setGameGroup={setGroup} setCountryVisible={setCountryVisible} navigation={props.navigation} item={item} />}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ flexGrow: 1 }}

                    />

                ) : (
                    <View style={styles.chatEmptyContainer}>
                        <Text style={styles.chatEmptyText}>No games created!</Text>
                        <Text>Click the icon above to create a new Game</Text>
                    </View>
                )}
            </View>
            {visible ? <CreateGroup setVisible={setVisible} setRooms={setRooms} fetchGroups={fetchGroups} /> : ""}
            <Modal animationType={"slide"} transparent={true} visible={countryVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>

                <View style={styles.modal}>
                    <View style={styles.content}>
                        <View style={styles.listItem}>
                            <Icon name="earth" />
                            <AppText style={styles.text}> Select Origin Country</AppText>
                        </View>
                    </View>
                    <CountryPicker selectedItem={handleSelection} />


                </View>
            </Modal>
            <View >
                <Button
                    onPress={play}
                    mode="contained">
                    Play
                </Button>
            </View>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    content: {
        display: "flex",
        flexDirection: 'row',
    },
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
    chatListContainer: {
        paddingHorizontal: 10,

    },
    chatEmptyContainer: {
        width: "100%",
        height: "80%",
        alignItems: "center",
        justifyContent: "center"
    },
    chatEmptyText: {
        fontWeight: "bold",
        fontSize: 24,
        paddingBottom: 30
    },
    modal: {

        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        display: "flex",
        flexDirection: 'column',

        width: 300,
        height: 300,

        margin: 50,
        marginTop: 200
    },
    text: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
    },
    textI: {
        width: 200,
        height: 30,
    },
    touchableButton: {
        width: '70%',
        padding: 1,
        backgroundColor: '#f06292',
        marginBottom: 10,
        marginTop: 30,
    },
});