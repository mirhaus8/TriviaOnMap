import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import socket from "./../../utils/socketio";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { Button, Switch } from "react-native-paper";
import { storage } from "../../firebase";
import * as ImagePicker from 'expo-image-picker';





export const UploadQuestion = ({ role, username, setVisible, setRooms, fetchGroups }) => {
    const [groupName, setGroupName] = React.useState("");
    const [image, setImage] = React.useState(null);
    const [tagUpload, setTagUpload] = useState('');
    const [answerholder, setAnswerholder] = useState('Enter Answer');
    const [answer, setAnswer] = useState('');
    const [nameholder, setNameholder] = useState('Image Name');
    const [imageName, setImageName] = useState("");








    const closeModal = () => setVisible(false);


    const handleCreateRoom = () => {
        teacherToSend = role == "teacher" ? username : ""
        socket.emit("createGame", { "gameName": groupName, "teacher": teacherToSend }, (x) => {
            fetchGroups()
            //setRooms(x)
        });
        closeModal();
    };

    const uploadImage = async () => {
        console.log("imageName", imageName, "answer", answer)
        if (image == null) return
        let urlFireBase = null;
        try {
            const response = await fetch(image)
            const blobFile = await response.blob()

            const imageRef = ref(storage, `images/${imageName}.jpg`)
            const result = await uploadBytes(imageRef, blobFile)
            urlFireBase = await getDownloadURL(result.ref)
    //        console.log("hererere 99", urlFireBase, answer)
            setUrl(urlFireBase)
      //      console.log("urrrrlllllll", url)

            // return url
        } catch (err) {
        //    console.log("errror", err);
            // return Promise.reject(err)
        }
        //console.log("hi before addQuestion")
        await addQuestion(urlFireBase, tagUpload)
        setAnswerholder('Enter Answer');
        setNameholder('Image Name')

        setAnswer('');
        setImageName('')

    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        //console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
           // console.log(result, result.assets.length, result.assets[0], "     boom        ", result.assets[0].uri)
        }
    };

    return (
        <View style={styles.Container}>
        {/* <View style={styles.secondContent}> */}
            <View style={styles.group}>
                <View style={{ display: "flex", flex: 1, marginRight: 10 }}>
                    <Button onPress={pickImage} style={{ backgroundColor: 'green' }} mode="contained">Select Image</Button>
                </View>
                <View style={{ display: "flex", flex: 1 }}>
                    <TextInput style={styles.textII}
                        value={tagUpload}
                        onChangeText={setTagUpload}
                        placeholder="tags- comma"
                    />
                </View>
            </View>
            <View style={styles.group}>
                <View style={{ display: "flex", flex: 1 }}>
                    <TextInput style={styles.textI}
                        placeholder={answerholder}
                        onChangeText={setAnswer}
                        value={answer}
                    />
                </View>
                <View style={{ display: "flex", flex: 1, marginLeft: 15 }}>
                    <TextInput style={styles.textI}
                        placeholder={nameholder}
                        onChangeText={setImageName}
                        value={imageName}
                    />
                </View>

            </View>
            <View style={styles.group}>

                <View style={{ display: "flex", flex: 1, marginRight: 10 }}>
                    <Button onPress={uploadImage} style={{ backgroundColor: 'green' }} mode="contained"> Upload Image</Button>
                </View>
            </View>
        </View>
        // </View>
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
        height: 200,
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
    },
    textII: {
        // width: 170,
        height: 30,

    }, textI: {
        // width: 170,
        height: 30,

    },

    group: {
        marginTop: 10,

        width: "100%",
        flexDirection: "row",
        display: "flex",
        flex: 1,



    },
    picker: {
        marginTop: 10,

        flexDirection: "row",
        display: "flex",
        flex: 1,

    },

    secondContent: {
        display: "flex",
        flexDirection: 'column',
        height: 150,
        marginBottom: 10,
        borderRadius: 5,
        paddingHorizontal: 5,
        backgroundColor: "#fff",
    },




    
});