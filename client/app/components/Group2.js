import { Text, Pressable, StyleSheet, ScrollView, View, Image, Dimensions } from "react-native";
import React, { useLayoutEffect, useState, useEffect, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import SelectDropdown from 'react-native-select-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { Button } from "react-native-paper";
import { SelectList } from 'react-native-dropdown-select-list';
import { authContext } from "../context/AuthContext";
const axios = require('axios');

import { storage } from "../../firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';





export const Group2 = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);

    const navigation = useNavigation();
    const [messages, setMessages] = useState({});
    const [image, setImage] = React.useState(null);
    const [imageList, setImageList] = React.useState([]);
    const [level, setLevel] = React.useState("");
    const [grade, setGrade] = React.useState("");
    const [users, setUsers] = useState([]);
    const [subject, setSubject] = React.useState("");


    const classes = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth']
    const subjects = [
        'math', 'geometry', 'history'
    ]
    const [selectedMultiple, setSelectedMultiple] = React.useState([]);
    const levels = [
        'Easy', 'Medium', 'Hard'
    ]


    const imageListRef = ref(storage, 'images/')

    const uploadImage = async () => {
        if (image == null) return
        try {
            const response = await fetch(image)
            const blobFile = await response.blob()

            const imageRef = ref(storage, "images/your_name355.jpg")
            const result = await uploadBytes(imageRef, blobFile)
            const url = await getDownloadURL(result.ref)

        } catch (err) {
        }

    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });


        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const getNewToken = async () => {
        let userRefreshToken = await AsyncStorage.getItem('userRefToken');
        let options = {
            method: 'POST',
            url: "http://54.161.154.243/token",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'RefreshToken': userRefreshToken
            },

        };
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
                await setTokens(response.data.accessToken)
            }
        } catch { }
    }

    const getUsers = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://54.161.154.243/getAllUsers",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                school: props.school,
                grade: grade,
                role: props.role
            }
        };
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
                const userNames = response.data.map(user => user.name);
                setUsers(userNames);
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data == "token invalid") {
                await getNewToken()
                await getUsers()
            }
        }
    };


    useEffect(() => {
        getUsers()
    }, [grade]);

    return (
        <View style={styles.content}>
            <View style={styles.group}>
                <MaterialIcons name="groups" size={40} color="black" style={styles.avatar} />

                <View style={styles.rightContainer}>
                    <View>
                        <Text style={styles.username}>{props.item}</Text>
                    </View>
                </View>
            </View>
            <View style={{ flex: 0.2, display: "flex", flexDirection: 'row', marginBottom: 2 }}>
                <SelectDropdown style={{ marginButton: 5 }}
                    data={classes}
                    onSelect={(selectedItem, index) => {
                        setGrade(selectedItem);
                        props.setTeamsMembers(prevState => {

                            const teamToUpdateIndex = prevState.findIndex(team => team.name === props.item);
                            if (teamToUpdateIndex === -1)
                                return [...prevState, { gameName: props.gameName, name: props.item, grade: selectedItem, subject: "", level: "", members: [] }];
                            const updatedTeamMembers = [...prevState];
                            const teamToUpdate = updatedTeamMembers[teamToUpdateIndex];
                            teamToUpdate.grade = selectedItem;
                            return updatedTeamMembers;
                        });
                    }}
                    defaultButtonText={'Class'}
                    buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem;
                    }}

                />

            </View>
            <View style={{ flex: 0.4, display: "flex", flexDirection: 'row', marginBottom: 2 }}>
                <View style={styles.multipleSelectorContainer}>
                    <SelectDropdown
                        data={users}
                        onSelect={(selectedItem, index) => {
                            setSelectedMultiple([...selectedMultiple, selectedItem]);
                            props.setTeamsMembers(prevState => {

                                const teamToUpdateIndex = prevState.findIndex(team => team.name === props.item);
                                if (teamToUpdateIndex === -1)
                                    return [...prevState, { gameName: props.gameName, name: props.item, grade: "", subject: "", level: "", members: [selectedItem] }];
                                const updatedTeamMembers = [...prevState];
                                const teamToUpdate = updatedTeamMembers[teamToUpdateIndex];
                                teamToUpdate.members = [...teamToUpdate.members, selectedItem];
                                return updatedTeamMembers;
                            });
                        }}
                        defaultButtonText={'Team Members'}
                        buttonTextAfterSelection={(selectedItem, index) => {

                            return 'Team Members';
                        }}
                        rowTextForSelection={(item, index) => {
                            return item
                        }}
                    />


                </View>
                <View style={{ display: "flex", flex: 1 }}>
                    <Text style={styles.username}>Team members:</Text>
                    <ScrollView>
                        {selectedMultiple.map((username, index) => (
                            <Text key={index}>{username}</Text>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <View style={{ flex: 0.17, display: "flex", flexDirection: 'row' }}>
                <View style={styles.multipleSelectorContainer}>


                    <ScrollView
                    >
                        <SelectDropdown
                            data={levels}
                            onSelect={(selectedItem, index) => {
                                setLevel(selectedItem);
                                props.setTeamsMembers(prevState => {

                                    const teamToUpdateIndex = prevState.findIndex(team => team.name === props.item);
                                    if (teamToUpdateIndex === -1)
                                        return [...prevState, { gameName: props.group, name: props.item, grade: "", subject: "", level: selectedItem, members: [] }];
                                    const updatedTeamMembers = [...prevState];
                                    const teamToUpdate = updatedTeamMembers[teamToUpdateIndex];
                                    teamToUpdate.level = selectedItem;
                                    return updatedTeamMembers;
                                });
                            }}
                            defaultButtonText={'Team Level'}
                            buttonTextAfterSelection={(selectedItem, index) => {
                                return selectedItem;
                            }}
                            rowTextForSelection={(item, index) => {
                                return item
                            }}
                        />

                    </ScrollView>
                </View>
                <View style={{ display: "flex", flex: 1, marginRight: 15 }}>
                    <SelectDropdown
                        data={subjects}
                        onSelect={(selectedItem, index) => {
                            setSubject(selectedItem);
                            props.setTeamsMembers(prevState => {

                                const teamToUpdateIndex = prevState.findIndex(team => team.name === props.item);
                                if (teamToUpdateIndex === -1)
                                    return [...prevState, { gameName: props.group, name: props.item, subject: selectedItem, level: "", members: [] }];
                                const updatedTeamMembers = [...prevState];
                                const teamToUpdate = updatedTeamMembers[teamToUpdateIndex];
                                teamToUpdate.subject = selectedItem;
                                return updatedTeamMembers;
                            });
                        }}
                        defaultButtonText={'Subject'}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            return selectedItem;
                        }}

                    />
                </View>
            </View>
        </View>
    );
};



const styles = StyleSheet.create({
    content: {
        display: "flex",
        flexDirection: 'column',
        height: (Dimensions.get('window').height) / 2.5,
        marginBottom: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
    },
    group: {
        width: "100%",
        flexDirection: "row",
        display: "flex",
        flex: 0.1,
        marginBottom: 2


    },
    avatar: {
        marginRight: 10,
        flex: 0.75,

    },
    multipleSelector: {


    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,


    },
    message: {
        fontSize: 14,
        opacity: 0.7,
    },
    time: {
        opacity: 0.5,
    },
    rightContainer: {
        flex: 4,
        flexDirection: "row",





    },
    multipleSelectorContainer: {

        display: "flex",
        flex: 1.5,

        marginRight: 10

    },
});