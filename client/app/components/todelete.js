import { View, Text, TextInput, Pressable, StyleSheet, Dimensions } from "react-native";
import React, { useState } from "react";
import socket from "./../../utils/socketio";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { Button, Switch } from "react-native-paper";
import { storage } from "../../firebase";
import * as ImagePicker from 'expo-image-picker';



export const Todelete = (props) => {
    const [teamName, setTeamName] = React.useState("");
    const [image, setImage] = React.useState(null);
    const [tagUpload, setTagUpload] = useState('');
    const [answerholder, setAnswerholder] = useState('Enter Answer');
    const [answer, setAnswer] = useState('');
    const [nameholder, setNameholder] = useState('Image Name');
    const [imageName, setImageName] = useState("");


    const uploadImage = async () => {
        props.setVisibleUp(false)
        // console.log("imageName", imageName, "answer", answer)
        // if (image == null) return
        // let urlFireBase = null;
        // try {
        //     const response = await fetch(image)
        //     const blobFile = await response.blob()

        //     const imageRef = ref(storage, `images/${imageName}.jpg`)
        //     const result = await uploadBytes(imageRef, blobFile)
        //     urlFireBase = await getDownloadURL(result.ref)
        //     console.log("hererere 99", urlFireBase, answer)
        //     setUrl(urlFireBase)
        //     console.log("urrrrlllllll", url)

        //     // return url
        // } catch (err) {
        //     console.log("errror", err);
        //     // return Promise.reject(err)
        // }
        // console.log("hi before addQuestion")
        // await addQuestion(urlFireBase, tagUpload)
        // setAnswerholder('Enter Answer');
        // setNameholder('Image Name')

        // setAnswer('');
        // setImageName('')


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
            //console.log(result, result.assets.length, result.assets[0], "     boom        ", result.assets[0].uri)
        }
    };
    return (
        <View style={styles.Container}>
            <Text style={styles.Subheading}>Upload New Image</Text>
            
            <Button onPress={pickImage} style={{ backgroundColor: 'green' }} mode="contained">Select Image</Button>

            <View style={{ display: "flex", flex: 1, flexDirection: "row", alignItems: "center", }}>
                    <Text >tags:</Text>
            <TextInput style={styles.textII}
                value={tagUpload}
                onChangeText={setTagUpload}
                placeholder=" comma separated tags"
            />
            </View>
            <View style={styles.ButtonContainer}>
                <View style={{ display: "flex", flex: 1, flexDirection: "row", alignItems: "center", }}>
                    <Text >answer:</Text>
                    <TextInput style={styles.textI}
                        placeholder={answerholder}
                        onChangeText={setAnswer}
                        value={answer}
                    />
                </View>
                <View style={{ display: "flex", flex: 1, flexDirection: "row", alignItems: "center", }}>
                    <Text >Image Name:</Text>
                    <TextInput style={styles.textI}
                        placeholder={nameholder}
                        onChangeText={setImageName}
                        value={imageName}
                    />
                </View>
            </View>


            <Button onPress={uploadImage} mode="text" style={{ backgroundColor: 'transparent' }}>
                <Text style={{ color: 'green' }}>Upload Image</Text>
            </Button>


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
        // height: 280,
        backgroundColor: "#fff",
        position: "absolute",
        bottom: 0,
        zIndex: 10,

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
        fontWeight: 'bold',

    }, textI: {
        // width: 170,
        height: 30,
        fontWeight: 'bold',
        marginLeft: 5

    },

});