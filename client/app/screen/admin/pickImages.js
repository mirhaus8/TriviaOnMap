import { Button, Switch } from "react-native-paper";
import { Text, Pressable, StyleSheet, ScrollView, View, Image, SafeAreaView, Dimensions } from "react-native";
import React, { useLayoutEffect, useState, useEffect, useContext } from "react";
import { storage } from "../../../firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { List, MD3Colors, TextInput } from 'react-native-paper';
import SelectDropdown from 'react-native-select-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { MyContext } from "../../context/QuestionsContext";
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { authContext } from "../../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';



const axios = require('axios')







export const PickImages = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);

    const [answer, setAnswer] = useState('');
    const [image, setImage] = React.useState(null);
    const [level, setLevel] = React.useState("");
    const [url, setUrl] = React.useState("");
    const [imagesList, setImagesList] = React.useState([]);
    const [grade, setGrade] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [visible, setVisible] = useState(false);
    const [visibleUp, setVisibleUp] = useState(true);
    const [imageName, setImageName] = useState("");
    const [answerholder, setAnswerholder] = useState('Enter Answer');
    const [nameholder, setNameholder] = useState('Image Name');
    const [imageId, setImageId] = React.useState("");
    const [imgId, setImgId] = React.useState("");
    const [selectedMultiple, setSelectedMultiple] = React.useState([]);
    const [tagUpload, setTagUpload] = useState('');
    const [addTag, setAddTag] = useState('');
    const [isSwitchOn, setIsSwitchOn] = React.useState(false);
    const [isSwitchOnPrivate, setIsSwitchOnPrivate] = React.useState(false);
    const [showAlert3, setShowAlert3] = React.useState(false);
    const [showAlertAddedQuestion, setShowAlertAddedQuestion] = React.useState(false);

    const onToggleSwitch = async () => { setIsSwitchOn(!isSwitchOn); };
    const onToggleSwitchPrivate = async () => { setIsSwitchOnPrivate(!isSwitchOnPrivate); };



    const { questionList, setQuestionList } = useContext(MyContext);

    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState('');


    const handleAddTag = () => {
        if (tag.trim() !== '') {
            setTags((prevTags) => [...prevTags, tag.trim()]);
            setTag('');
        }
    };

    const ShowAlert3 = () => {
        setShowAlert3(true);
    };

    const hideAlert3 = () => {
        setShowAlert3(false);
    };

    const ShowAlertAddedQuestion = () => {
        setShowAlertAddedQuestion(true);
    };

    const hideAlertAddedQuestion = () => {
        setShowAlertAddedQuestion(false);
    };









    const levels = [
        'easy', 'medium', 'hard'
    ]
    const subjects = [
        'math', 'geometry', 'history'
    ]
    const classes = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth']


    const imageListRef = ref(storage, 'images/')


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
                let userToken = await AsyncStorage.getItem('userToken');
            }
        } catch { }
    }

    const addQuestionToGame = async (imageIdDefault = null, tagsToAdd = "") => {
        let userToken = await AsyncStorage.getItem('userToken');

        let options = {
            method: 'POST',
            url: "http://54.161.154.243/addQuestionToGame",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                role: props.route.params.role,
                id: imageIdDefault ? imageIdDefault : imageId,
                difficulty: level,
                class: grade,
                gameName: props.route.params.gameName,
                tags: tagsToAdd ? tagsToAdd.split(',').map(word => word.trim()) : []
            }

        };
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
                ShowAlertAddedQuestion()

            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data == "token invalid") {
                await getNewToken()
                await addQuestionToGame(imageIdDefault, tagsToAdd)
            }
        }
    }

    const addAllQuestionsToGame = async (imageIdDefault = null, tagsToAdd = "") => {
        let userToken = await AsyncStorage.getItem('userToken');

        let options = {
            method: 'POST',
            url: "http://54.161.154.243/addAllQuestionsToGame",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                role: props.route.params.role,
                ids: imagesList.map(question => question[2]),
                difficulty: level,
                class: grade,
                gameName: props.route.params.gameName,
                tags: tagsToAdd ? tagsToAdd.split(',').map(word => word.trim()) : []
            }

        };
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
                ShowAlertAddedQuestion()

            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data == "token invalid") {
                await getNewToken()
                await addAllQuestionsToGame(imageIdDefault, tagsToAdd)
            }
        }
    }

    const addTagsToQuestion = async (questionId, tags) => {
        let options = {
            method: 'POST',
            url: "http://54.161.154.243/addQuestionToGame",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {
                questionId: questionId,
                tags: tags,
                role: props.route.params.role
            }

        };
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        if (responseOK) {
        };
    }


    const uploadImage = async () => {
        if (image == null) return
        let urlFireBase = null;
        try {
            const response = await fetch(image)
            const blobFile = await response.blob()

            const imageRef = ref(storage, `images/${imageName}.jpg`)
            const result = await uploadBytes(imageRef, blobFile)
            urlFireBase = await getDownloadURL(result.ref)
          
            setUrl(urlFireBase)
            

            
        } catch (err) {
            
        }
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
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const getAdminQuestions = async () => {
        if(!grade || !level|| !subject){
            ShowAlert3()
        }
        else{
        let userToken = await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://54.161.154.243/getAllAdminQuestions",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                private: isSwitchOnPrivate, role: props.route.params.role, owner: props.route.params.username, class: grade, difficulty: level, subject: subject, tags: tag.split(',').map(word => word.trim())
            }
        };
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
                const questions = response.data.questions.map(question => [question.name, question.path, question._id]);
                setImagesList(questions);

            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data == "token invalid") {
                await getNewToken()
                await getAdminQuestions()
            }
        }
    }
    }

    const addQuestion = async (urlFireBase, tagsToAdd = "") => {
        let userToken = await AsyncStorage.getItem('userToken');

        let options = {
            method: 'POST',
            url: "http://54.161.154.243/addQuestion",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                role: props.route.params.role,
                path: urlFireBase,
                difficulty: level,
                subject: subject,
                answer: answer,
                owner: isSwitchOnPrivate ? props.route.params.username : "",
                class: grade,
                name: imageName,
                tags: tagsToAdd.split(',').map(word => word.trim())
            }
        };
        try {
            let response = await axios(options);
            let responseOK = response && response.status === 200;
            if (responseOK) {
          
                setImgId(response.data._id)

                addQuestionToGame(response.data._id)

            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data == "token invalid") {
                await getNewToken()
                await addQuestion(urlFireBase, tagsToAdd )
            }
        }
    }


    return (
        <SafeAreaView >
            <ScrollView>
                <View style={{flex:1}}>

                <AwesomeAlert
                show={showAlert3}
                showProgress={false}
                title="Missing Details"
                message="Please Fill All the Question Details"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlert3();
                }}
                onConfirmPressed={() => {
                    hideAlert3();
                    
                    
                }}
            />
            <AwesomeAlert
                show={showAlertAddedQuestion}
                showProgress={false}
                title="Added Question/s"
                message=""
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="OK"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlertAddedQuestion();
                }}
                onConfirmPressed={() => {
                    hideAlertAddedQuestion();

                    

                }}
            />


                    <View style={styles.content}>

                        <View style={styles.picker}>
                            <Text style={styles.label}>Level Selection</Text>
                            <View style={styles.rightContent}>
                                <SelectDropdown
                                    data={levels}
                                    onSelect={(selectedItem, index) => {
                                        setLevel(selectedItem);
                                        
                                    }}
                                    defaultButtonText={'Level'}
                                    buttonTextAfterSelection={(selectedItem, index) => {

                                        return selectedItem;
                                    }}

                                />
                            </View>
                        </View>
                        <View style={styles.picker}>
                            <Text style={styles.label}>class Selection</Text>
                            <View style={styles.rightContent}>
                                <SelectDropdown
                                    data={classes}
                                    onSelect={(selectedItem, index) => {
                                        setGrade(selectedItem);
                                        
                                    }}
                                    defaultButtonText={'Class'}
                                    buttonTextAfterSelection={(selectedItem, index) => {

                                        return selectedItem;
                                    }}

                                />
                            </View>
                        </View>
                        <View style={styles.picker}>
                            <Text style={styles.label}>Subject Selection</Text>
                            <View style={styles.rightContent}>
                                <SelectDropdown
                                    data={subjects}
                                    onSelect={(selectedItem, index) => {
                                        setSubject(selectedItem);
                                    }}
                                    defaultButtonText={'Subject'}
                                    buttonTextAfterSelection={(selectedItem, index) => {

                                        return selectedItem;
                                    }}

                                />
                            </View>
                        </View>
                        <View style={{ display: "flex", flexDirection: "row" }}>
                            <View style={styles.picker}>

                                <Text style={styles.label}>Tags</Text>
                                <View style={styles.rightContent2}>
                                    <TextInput style={styles.textTag}
                                        value={tag}
                                        onChangeText={setTag}
                                        placeholder="comma-separated tags"
                                    />
                                </View>

                            </View>
                        </View>
                        <View style={styles.picker}>
                                    <Text style={styles.label}>Private Collection</Text>
                                    <View style={styles.rightContent2}>
                                        <Switch
                                            trackColor={{ false: '#FFFFFF', true: 'green' }}
                                            value={isSwitchOnPrivate}
                                            onValueChange={onToggleSwitchPrivate} />
                                    </View>
                                </View>

                        <Button onPress={getAdminQuestions} mode="text" style={{ backgroundColor: 'transparent' }}>
                            <Text style={{ color: 'green' }}>Get Questions</Text>
                        </Button>

                    </View>

                    <View style={styles.thirdContent}>

                        
                        <View style={{ display: "flex", flex: 1 }}>
                            <View style={{ display: "flex", flex: 0.4 }}>
                                <View style={styles.picker}>
                                    <Text style={styles.label}>Image Name</Text>
                                    <View style={styles.rightContent}>
                                        <SelectDropdown
                                            data={imagesList}
                                            onSelect={(index) => { setSelectedImage(index[1]); setVisible(true); setImageId(index[2]) }}
                                            buttonTextAfterSelection={(selectedItem, index) => {
                                                return selectedItem[0];
                                            }}
                                            defaultButtonText={'Image Name'}
                                            rowTextForSelection={(item, index) => {
                                                return item[0]
                                            }}
                                        />
                                    </View>
                                </View>

                                <View style={{ display: "flex", flexDirection: "row" }}>
                                    <View style={styles.picker}>
                                        <Text style={styles.label}>Tags</Text>
                                        <View style={styles.rightContent2}>
                                            <TextInput style={styles.textTag}
                                                value={addTag}
                                                onChangeText={setAddTag}
                                                placeholder="comma-separated tags"
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.picker}>
                                    <Text style={styles.label}>Use All Questions</Text>
                                    <View style={styles.rightContent2}>
                                        <Switch
                                            trackColor={{ false: '#FFFFFF', true: 'green' }}
                                            value={isSwitchOn}
                                            onValueChange={onToggleSwitch} />
                                    </View>
                                </View>
                            </View>
                            
                            <View style={{ display: "flex", flex: 0.5 }}>
                                {visible ?
                                    <View style={{ display: "flex", flexDirection: "column" }}>
                                        <View style={{ display: "flex", flexDirection: "row", }}>
                                            {selectedImage ? <Image source={{ uri: selectedImage }} style={{ display: "flex", flex: 1, width: 190, height: 190, resizeMode: 'contain' }} /> : ""}

                                        </View>

                                    </View>
                                    : ""}

                            </View>
                            <View style={{ display: "flex", flex: 0.1 }}>
                                <View style={{ display: "flex", flexDirection: "column", alignItems: 'center' }}>
                                    <TouchableOpacity onPress={async () => isSwitchOn ? await addAllQuestionsToGame(null, addTag) : await addQuestionToGame(imageId, addTag)} >
                                        <Icon name="plus" size={30} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                   
                    <View style={styles.secondContent}>
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
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
    content: {
        display: "flex",
        flexDirection: 'column',
        height: 300,
        marginBottom: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
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
    thirdContent: {
        display: "flex",
        flexDirection: 'column',
        height: 370,
        marginBottom: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
    },
    group: {
        marginTop: 10,

        width: "100%",
        flexDirection: "row",
        display: "flex",
        flex: 1,



    },
    textI: {
        // width: 170,
        height: 30,

    },
    textII: {
        // width: 170,
        height: 30,

    },
    textTag: {
        width: 170,
        height: 30,

    },
    picker: {
        marginTop: 10,

        flexDirection: "row",
        display: "flex",
        flex: 1,

    },
    label: {
        flex: 1,
        marginRight: 0,
    },
    rightContent: {
        flex: 1,
        marginRight: 10
    },
    rightContent2: {
        flex: 1,

        alignItems: 'flex-end'
    },
    container: {
        flex: 1,
        // justifyContent: 'flex-end',
        // height: windowHeight*0.8
      },
      content2: {
        backgroundColor: 'lightgray',
      },

})
