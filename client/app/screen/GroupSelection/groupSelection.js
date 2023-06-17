import React, { useContext } from "react";
import { View, Text, Pressable, SafeAreaView, FlatList, StyleSheet, Modal, ScrollView, ImageBackground } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Group } from "../../components/Group";
import { CreateGroup } from "./../../components/CreateGroup";
import socket from "../../../utils/socketio";
import Icon from './../../components/Icon';
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/AppText";
import CountryPicker from 'rn-country-dropdown-picker';
const axios = require('axios');
import { MyContext } from "../../context/QuestionsContext";

import { Button } from "react-native-paper";
import { authContext } from "../../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';



export const GroupSelection = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);
    const [rooms, setRooms] = React.useState([]);
    const [originCountry, setOriginCountry] = React.useState("");
    const [visible, setVisible] = React.useState(false);
    const [countryVisible, setCountryVisible] = React.useState(false);
    const [group, setGroup] = React.useState("");
    const { deletedGames, setDeletedGames } = useContext(MyContext);

    //const [questionList, setQuestionList] = React.useState([]);

    const onToggleCountry = (country) => {
        socket.emit("createTeam", { "gameName": group, "name": "", "originCountry": country["country"], "username": props.route.params.username, "members": [props.route.params.username] });
        //setVisible(false)
        setCountryVisible(false)
    };
    const play = () => { console.log("hiii before navigate"); props.navigation.navigate("Map2", { role: props.route.params.role, school: props.route.params.school, username: props.route.params.username, gameName: group, originCountry: originCountry }) };
    function handleSelection(country) {
       // console.log(country);
        setOriginCountry(country["country"]),
            onToggleCountry(country);
    }

    const createTeams = (gameName) => {
       // console.log("in groooououououp", group, props.route.params)
        setCountryVisible(false);
        props.navigation.navigate("UploadQuestion", { school: props.route.params.school, role: props.route.params.role, username: props.route.params.username, gameName: gameName })
    }

    

    const getNewToken = async () => {
        let userRefreshToken = await AsyncStorage.getItem('userRefToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/token",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'RefreshToken': userRefreshToken
            },
            
        };
        try {
            //console.log("in get refresh token")
            let response = await axios(options);
         //   console.log("responseOk refreshToken", response.status)
            let responseOK = response && response.status === 200;
         //   console.log("responseOk refreshToken", responseOK)
            if (responseOK) {
          //      console.log("in get refresh token",response.data.accessToken)
                await setTokens(response.data.accessToken)
            }
        }catch{}
    }

    const exitGame = async () => {
        
        props.navigation.navigate("Login", {})
        await logout()
    }

    

    const fetchGroups = async () => {
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/games",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                role: props.route.params.role, username: props.route.params.username
            }
        };
        try {
          //  console.log("token in getGamessssssss", userToken)
            let response = await axios(options);

            let responseOK = response && response.status === 200;
            if (responseOK) {
                setRooms(response.data.filter((obj) => !deletedGames.includes(obj.name)))
            }
            else {
         //       console.log("response.data", response.data)
            }
        } catch (error){
            if(error.response.data=="token invalid"){
           //     console.log("hi got invalid token")
                await getNewToken()
                await fetchGroups()
            }
         //   console.log("response.dataaaa", error.response.data)
        }

    };
    React.useLayoutEffect(() => {
        
       // console.log("hiiiii in useLay groupSelection11111111 ", user["user"], user["role"])
        fetchGroups();
      //  console.log("hiiiii in useLay groupSelection ", user["user"], user["role"])
        socket.on("gamesList", (rooms2) => {
//console.log("roooommmmsss layout", rooms2)
            setRooms(rooms2.filter((obj) => !deletedGames.includes(obj.name)));
        });
        
    }, [socket]);


    React.useEffect(() => {
       // console.log("hiiiii in useEffect groupSelection ")
        socket.on("gamesList", (rooms2) => {
         //   console.log("roooommmmsss effect", rooms2.filter((obj) => !deletedGames.includes(obj.name)))
            setRooms(rooms2.filter((obj) => !deletedGames.includes(obj.name)));
            fetchGroups();
        });
    }, [socket]);

    return (
       
        <SafeAreaView style={styles.chatScreen}>
             <ImageBackground
        source={require('/Users/hausmann/conquerTheWorld4/assets/worldMapGame.jpg')}
        style={{flex: 1,
            resizeMode: 'cover',opacity: 1}}>
            {/* <Pressable onPress={logout}> */}
            <Pressable onPress={exitGame}>
                <Feather name='log-out' size={24} color='black' />
            </Pressable>
            <View style={styles.chatTopContainer}>

                <View style={styles.chatHeader}>
                    <Text style={styles.chatHeading}>Group Selection</Text>

                    {props.route.params.role=="teacher" || props.route.params.role=="Teacher"?<Pressable onPress={() => setVisible(true)}>
                        <Feather name='edit' size={24} color='black' />
                    </Pressable>:""}
                </View>
            </View>

            <View style={styles.chatListContainer}>
                {rooms.filter((obj) => !deletedGames.includes(obj.name)).length > 0 ? (

                    <FlatList
                        data={rooms.filter((obj) => !deletedGames.includes(obj.name))}
                        renderItem={({ item }) => <Group role={props.route.params.role} username={props.route.params.username} setGameGroup={setGroup} setCountryVisible={setCountryVisible} createTeams={createTeams} navigation={props.navigation} fetchGroups={fetchGroups} item={item} />}
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
            {visible ? <CreateGroup role={props.route.params.role} username={props.route.params.username} setVisible={setVisible} setRooms={setRooms} fetchGroups={fetchGroups} /> : ""}
            <Modal animationType={"slide"} transparent={true} visible={countryVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>

                <View style={styles.modal}>
                    <View style={styles.content}>
                        <View style={styles.listItem}>
                            <Icon name="earth" />
                            <AppText style={styles.text}> Select Origin Country</AppText>
                        </View>
                    </View>
                    <Pressable style={styles.Button} onPress={createTeams}>
                        <Text style={styles.Text}>CREATE</Text>
                    </Pressable>

                </View>
            </Modal>
            <View >
                {/* <Button
                    onPress={play}
                    mode="contained">
                    Play
                </Button> */}
                {/* <Button
                    onPress={logout}
                    mode="contained">
                    logout
                </Button> */}
            </View>
            </ImageBackground>
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
        color: "black"
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