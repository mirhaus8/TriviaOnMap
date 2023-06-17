import { View, Text, Pressable, StyleSheet,TouchableOpacity } from "react-native";
import React, { useLayoutEffect, useState,useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";
import socket from "../../utils/socketio";
import { GameSummary } from "../screen/admin/GameSummary";
import { AntDesign } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authContext } from "../context/AuthContext";
const axios = require('axios');
import { Entypo } from '@expo/vector-icons';






export const Group = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);

    const navigation = useNavigation();
    const [messages, setMessages] = useState({});
    const [summaryVisible, setSummaryVisible] = useState(false);

    //👇🏻 Retrieves the last message in the array from the item prop
    // useLayoutEffect(() => {
    //     setMessages(props.item.messages[props.item.messages.length - 1]);
    // }, []);




    // const play = () => props.navigation.navigate("Map", {latitude:0.1849383647, longitude:0.17889222});
    // const play = () => props.navigation.navigate("Map", {latitude:0.1849383647, longitude:0.17889222});
    const setCountryPicker = () => {
        if (props.role == "student") {
            const teamWithUsername = props.item.teams.find(team => team.users.includes(props.username)).name;
            socket.emit("joinUserToGame", { "gameName": props.item.gameName, "teamName": teamWithUsername, "username": props.username});
            props.navigation.navigate("Map2", { username: props.username, gameName: props.item.gameName, teamName: teamWithUsername});
        }
        else {
            props.setGameGroup(props.item.gameName)
            props.createTeams(props.item.gameName);
        }

    };

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
            //console.log("responseOk refreshToken", response.status)
            let responseOK = response && response.status === 200;
            //console.log("responseOk refreshToken", responseOK)
            if (responseOK) {
                //console.log("in get refresh token",response.data.accessToken)
                await setTokens(response.data.accessToken)
            }
        }catch{}
    }
 const endGame = async () =>{
    let userToken =  await AsyncStorage.getItem('userToken');
    let options = {
        method: 'POST',
        url: "http://10.0.0.8:3001/endGame",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Auth': userToken
        },
        data: {
            gameName:props.item.gameName,
            role:props.role
        }
    };
    try {
        socket.emit("stopGame",  { gameName: props.item.gameName}) 
    let response = await axios(options);
    let responseOK = response && response.status === 200;
    //console.log("just checlk status of delete", response.status)
    if (responseOK) {     
        // props.fetchGroups()       
        //console.log("gmae deleted", props.item.gameName)
    }}
 catch (error){
    if(error.response && error.response.data=="token invalid"){
        await getNewToken()
        await startGame()
    }
    else{
        //console.log("errorrr in delete", error)
    }
}
}
    const startGame = async () =>{
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/startGame",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                gameName:props.item.gameName,
                role:props.role
            }
        };
        try {
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        //console.log("just checlk status of delete", response.status)
        if (responseOK) {     
            // props.fetchGroups()       
            //console.log("gmae deleted", props.item.gameName)
        }}
     catch (error){
        if(error.response && error.response.data=="token invalid"){
            await getNewToken()
            await startGame()
        }
        else{
            //console.log("errorrr in delete", error)
        }
    }
    }
    const deleteGame = async () => {
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/deleteGame",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                gameName:props.item.gameName,
                role:props.role
            }
        };
        try {
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        //console.log("just checlk status of delete", response.status)
        if (responseOK) {     
            props.fetchGroups()       
            //console.log("gmae deleted", props.item.gameName)
        }}
     catch (error){
        if(error.response && error.response.data=="token invalid"){
            await getNewToken()
            await deleteGame()
        }
        else{
            //console.log("errorrr in delete", error)
        }
    }
       
    };


    const showGameStatus = () => {
        props.navigation.navigate("GameStatus", { roel: props.role, gameName: props.item.gameName });
    }
    const showSummary = () => {
        setSummaryVisible(true)
    }


    return (
        <View >

            {/* <Button
                    onPress={showSummary}
                    mode="contained">
                    Game Summary
            </Button> */}
            <View style={styles.group} >
                <Ionicons
                    name='globe'
                    size={45}
                    color='black'
                    style={styles.avatar}
                />

                <View style={styles.rightContainer}>
                    <View>
                        <View style={{ display: "flex", flexDirection: "row", marginTop:15, justifyContent: "space-between" }}>
                            <Text style={styles.username}>{props.item.gameName}</Text>
                            {/* <Ionicons
                                name='delete'
                                size={18}
                                color='black'
                                style={{marginLeft:300}}
                            /> */}
                             {props.role == "teacher" ? 
                             <TouchableOpacity onPress={() => !props.item.started? startGame(): endGame()} >
                                {!props.item.started ? <Entypo name="controller-jump-to-start" size={24} color="black" />:
                                <Entypo name="controller-stop" size={24} color="black" />}
                            </TouchableOpacity>:""}
                            {props.role == "teacher" ?
                            
                            <TouchableOpacity onPress={() => deleteGame()} >
                                <AntDesign name="delete" size={18} color="black" />
                            </TouchableOpacity>
                           
                            :""}
                        </View>
                        <GameSummary summaryVisible={summaryVisible} setSummaryVisible={setSummaryVisible} gameName={props.item.gameName} role={props.role}></GameSummary>
                        <Pressable onPress={setCountryPicker}>
                        <Text style={styles.message}>
                            {props.role == "teacher" ? "Tap to create teams" : "Tap to start play"}
                        </Text>
                        </Pressable>

                        {props.role == "teacher" ?
                            <View style={{ display: "flex", flexDirection: 'row', }}>
                                <Button
                                    onPress={showGameStatus}
                                >
                                    Game Status
                                </Button>
                                <Button
                                    onPress={showSummary}
                                >
                                    Game Summary
                                </Button>
                            </View> : ""}

                    </View>
                    {/* <View>
                    <Text style={styles.time}>
                        {messages?.time ? messages.time : "now"}
                    </Text>
                </View> */}
                </View>
            </View>
        </View>
    );
};



const styles = StyleSheet.create({
    group: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        height: 80,
        marginBottom: 10,
    },
    avatar: {
        marginRight: 15,
    },
    username: {
        fontSize: 18,
        marginBottom: 5,
        
        fontWeight: "bold",
    },
    message: {
        fontSize: 14,
        opacity: 0.7,
    },
    time: {
        opacity: 0.5,
    },
    rightContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
    },
});