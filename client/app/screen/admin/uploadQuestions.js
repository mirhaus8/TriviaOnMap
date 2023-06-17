import React, { useEffect, useState, useContext } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Button, Text } from "react-native-paper";
import { StyleSheet, SafeAreaView, View, Image, Pressable, FlatList, Modal, ImageBackground, ScrollView } from 'react-native';
import { storage } from "../../../firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { authContext } from "../../context/AuthContext";
import { Group2 } from "../../components/Group2";
import { PickImages } from "./pickImages";

import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { Picker } from '@react-native-picker/picker';
import { CreateTeam } from "./../../components/CreateTeam";

import { Feather } from "@expo/vector-icons";
import socket from "../../../utils/socketio";
import AsyncStorage from '@react-native-async-storage/async-storage';



const axios = require('axios')



export const UploadQuestion = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);

    const [image, setImage] = React.useState(null);
    const [imageList, setImageList] = React.useState([]);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = React.useState([]);
    const [visible, setVisible] = React.useState(false);
    const [group, setGroup] = React.useState("");
    const [countryVisible, setCountryVisible] = React.useState(false);
    const [teamsMembers, setTeamsMembers] = React.useState([]);

    const [modalVisible, setModalVisible] = React.useState(false);







    const [selectedUser, setSelectedUser] = useState('');
    const [selectedMultiple, setSelectedMultiple] = React.useState("");

    const imageListRef = ref(storage, 'images/')

    const uploadImage = async () => {
        if (image == null) return
        try {
            const response = await fetch(image)
            const blobFile = await response.blob()

            const imageRef = ref(storage, "images/your_name3.jpg")
            const result = await uploadBytes(imageRef, blobFile)
            // const url = await getDownloadURL(result.ref)

            // return url
        } catch (err) {
           // console.log("errror");
            // return Promise.reject(err)
        }

    }


    const getNewToken = async () => {
        let userRefreshToken = await AsyncStorage.getItem('userRefToken');
        //console.log("refresh tokennnn", userRefreshToken)
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
          //  console.log("responseOk refreshToken", response.status)
            let responseOK = response && response.status === 200;
            //console.log("responseOk refreshToken", responseOK)
            if (responseOK) {
              //  console.log("in get refresh token", response.data.accessToken)
                await setTokens(response.data.accessToken)
            }
        } catch { }
    }

    const submit = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/submitTeams",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                teamsMembers,
                role: props.route.params.role
            }
        };
        try {
            let response = await axios(options);
         //   console.log(response);
            let responseOK = response && response.status === 200 && response.statusText === 'OK';
            if (responseOK) {
                let data = await response.data;
                socket.emit("joinUserToGame", { "gameName": props.route.params.gameName });

            }
        } catch (error) {
            if (error.response.data == "token invalid") {
                await getNewToken()
                await submit()
            }
        }
    };

    const getUsers = async () => {
        //console.log("in choooooseeee")
        let userToken = await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/getAllUsers",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: { role: props.route.params.role }
        };
        //console.log("choooseeeee45345", props.route.params.gameName)
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
                //console.log(response.data)
                const userNames = response.data.map(user => user.name);
                setUsers(userNames);
          //      console.log(userNames)

                //let data =  response.data;
                //loginHandler(data["accessToken"]);

                //console.log("jwtttttt", jwtDecode(userToken));
            }
        } catch (error) {
            if (error.response.data == "token invalid") {
                await getNewToken()
                await getUsers()
            }
        }
        // if (response.data != "")
        //     console.log(data)
        //props.navigation.navigate("Settings",{username: username})
    };

    const renderUserItems = () => {
        return users.map(user => (
            <Picker.Item key={user} label={user} value={user} />
        ));
    }




    useEffect(() => {
        getUsers();
        // listAll(imageListRef).then((response) => {
        //     console.log("responseeee", response)
        //     response.items.forEach((item) => {
        //         getDownloadURL(item).then((url) => {
        //             setImageList((prev) =>
        //                 [...prev, url]
        //             )
        //         })
        //     })
        //     console.log("imaaaagggggeeeList", imageList)
        // })
    }, []);

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
    const toggleModal = (visible) => {
        props.setModalVisible(visible);
    }



    const chooseQuestions = () => {console.log("before navigate to pickImages", props.route.params);
      props.navigation.navigate("PickImages", { role: props.route.params.role, gameName: props.route.params.gameName, username: props.route.params.username, questionList: props.route.params.questionList, setQuestionList: props.route.params.setQuestionList }) 
    };


    return (
        
        <SafeAreaView style={styles.chatScreen}>
            
           <ImageBackground
                        source={require('/Users/hausmann/conquerTheWorld4/assets/worldMapGame.jpg')}
                        style={{
                            flex: 1,
                            resizeMode: 'cover', opacity: 1
                        }}>

                    
                        
                        <View style={styles.chatTopContainer}>
                            <View style={styles.chatHeader}>
                                <Text style={styles.chatHeading}>Teams Creation</Text>

                                <Pressable onPress={() => setVisible(true)}>
                                    <Feather name='edit' size={24} color='green' />
                                </Pressable>
                            </View>
                        </View>
                        <View style= {{flexDirection:'row',marginTop:5,marginBottom:5}}>
                        <View style= {{flex:1}}>
                            <Button onPress={chooseQuestions} style={{ color: 'green', backgroundColor: 'green'}} mode="contained"> Choose Questions</Button>
                        </View>
                        <View style= {{flex:1}}>

                            <Button  onPress={submit} style={{color: 'green', backgroundColor: 'green'}} mode="contained" >Submit Groups</Button>
                            </View>

                        </View>
                        

                        <View style={styles.chatListContainer}>
                            {teams.length > 0 ? (
                                <View style={{marginBottom:50}}>
                                <FlatList
                                    data={teams}
                                    renderItem={({ item }) => <Group2 role={props.route.params.role} school={props.route.params.school} gameName={props.route.params.gameName} teamsMembers={teamsMembers} setTeamsMembers={setTeamsMembers} navigation={props.navigation} item={item} />}
                                    //keyExtractor={(item) => item._id}
                                    keyExtractor={(item, index) => index.toString()}
                                    contentContainerStyle={{ flexGrow: 1 }}

                                />
                                </View>
                            ) : (
                                <View style={styles.chatEmptyContainer}>
                                    <Text style={styles.chatEmptyText}>No games created!</Text>
                                    <Text>Click the icon above to create a new Game</Text>
                                </View>
                            )}
                        </View>
                        {visible ? <CreateTeam teams={teams} setVisible={setVisible} setTeams={setTeams} /> : ""}

                        

                    
                
                {/* <Button title="Select Image" onPress={submit} >Submit Groups</Button> */}
                </ImageBackground>
        </SafeAreaView>
       

    );
};



const styles = StyleSheet.create({
    content: {
        display: "flex",
        flexDirection: 'column',
    },
    chatScreen: {
        backgroundColor: "#F7F7F7",
        flex: 1,
        // padding: 10,
        // marginBottom: 50,
        position: "relative",
        flexDirection: 'column',
    },
    chatTopContainer: {
        backgroundColor: "#F7F7F7",
        height: 70,
        width: "100%",
        justifyContent: "center",
        marginBottom: 0,
        elevation: 2
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

    },
    modal: {

        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',

        width: 500,
        height: 800,
        marginTop: 500


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