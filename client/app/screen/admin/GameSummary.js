import React, { useState, useContext } from 'react';
import { View, Image, StyleSheet, Modal, Text } from 'react-native';
import { Table, Row, Rows, Col, TableWrapper } from 'react-native-table-component';
import SelectDropdown from 'react-native-select-dropdown';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authContext } from '../../context/AuthContext';


const axios = require('axios')


export const GameSummary = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);

    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const [summaryVisible, setSummaryVisible] = useState(true);
    const [dropVisible, setDropVisible] = useState(false);
    const [imageVisible, setImageVisible] = useState(false);
    const [image, setImage] = useState("");



    const getNewToken = async () => {
        let userRefreshToken = await AsyncStorage.getItem('userRefToken');
        //console.log("in getnewToken in game summary",userRefreshToken)
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
              //  console.log("in get refresh token",response.data.accessToken)
                await setTokens(response.data.accessToken)
            }
        }catch{}
    }


    const getAnsweredQuestions = async (gameName) => {
        let userToken =  await AsyncStorage.getItem('userToken');
        //console.log("hiii game summary")
        //console.log("hiiii login")
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/getAnsweredQuestions",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                gameName: gameName,
                role:props.role
            }
        };
        try{
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        if (responseOK) {
            let data = response.data;
          //  console.log("game Summary", data["questions"])


            const transformedAnsweredData = data["questions"].reduce((acc, curr) => {
                const { username, team, questionPath } = curr;
                const userIndex = acc.findIndex((el) => el.username === username);
                if (userIndex === -1) {
                    acc.push({ username, team, questionPath: [{ fullPath: questionPath, fileName: questionPath.split('/').pop() }] });
                } else {
                    acc[userIndex].questionPath.push({ fullPath: questionPath, fileName: questionPath.split('/').pop() });
                }
                return acc;
            }, []);


            // const transformedData = [];
            // data["questions"].forEach(question => {
            //     const { username, team, questionPath } = question;
            //     if (!transformedData[username]) {
            //         transformedData[username] = { team, questionPaths: [questionPath] };
            //     } else {
            //         transformedData[username].questionPaths.push(questionPath);
            //     }
            // });
            //console.log("game Summary", transformedAnsweredData)
            setAnsweredQuestions(transformedAnsweredData)

        }
    }catch (error){
        if(error.response.data=="token invalid"){
            await getNewToken()
            await getAnsweredQuestions(gameName)
        }
    }
    }


    React.useLayoutEffect(() => {
        getAnsweredQuestions(props.gameName);
    }, []);

    // const onImageSelect = (questions, selectedItem, index) => {

    //     const selectedFile = questions[index];
    //     console.log("hiiiiiii selected item",selectedFile)
    //     // setImageVisible(true)
    //     // setImage(selectedFile.fullPath); 
    //   }

    const renderQuestions = (questions) => {
       // console.log(questions)
        return (
            <View>
                {/* <TouchableHighlight style={styles.touchableButton}
                            onPress={() => {setDropVisible(true)}}>
                                <Text style={styles.text}>Select</Text>
                            </TouchableHighlight> */}
                {dropVisible ? <SelectDropdown

                    data={questions.map(file => file.fileName)}
                    onSelect={(selectedItem, index) => {
                        // setImageVisible(true)
                        // setImage(questions[index].fullPath); 
                      //  console.log("questionnnnnnnn", selectedItem.substring(selectedItem.lastIndexOf("/") + 1))
                        //onImageSelect(selectedItem, index)
                        // setDropVisible(false)


                    }}
                    defaultButtonText="Select"
                    buttonTextAfterSelection={(selectedItem) => selectedItem.substring(selectedItem.lastIndexOf("/") + 1)}
                    buttonStyle={styles.questionDropdownButton}
                    dropdownStyle={styles.questionDropdownList}
                    dropdownTextStyle={styles.questionDropdownItem}
                /> : ""}

                {/* <MultipleSelectList
                            setSelected={(val) => console.log("miltiple", val)}
                            data={questions.map(file => file.fileName)}
                            save="value"
                            
                        /> */}
            </View>

        );
    };

    return (
        <Modal animationType={"slide"} transparent={true} visible={props.summaryVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>
            {/* <View style={styles.modal}> */}
            <View style={styles.container}>
                {/* <Table borderStyle={{borderWidth: 1, borderColor: '#ffa1d2'}}>
          <Row data={[['Head1', 'Head2', 'Head3', 'Head4', 'Head5']]} style={styles.HeadStyle} textStyle={styles.TableText}/>
          <Rows data={data} textStyle={styles.TableText}/>
        </Table> */}

                {/* <Text>hiiiiiiiii3434</Text> */}
                <Table borderStyle={{ borderWidth: 1, borderColor: '#ffa1d2' }}>
                    <Row data={['Username', 'Team', ' Number Questions answered']} style={styles.head} />
                    {/* <Rows data={data} /> */}
                    <TableWrapper style={styles.wrapper}>
                        <Col
                            data={answeredQuestions.map((row) => row.username)}
                            style={styles.title}
                            heightArr={[70, 70]}
                            // textStyle={styles.text}
                        />
                        {/* <Col
                        data={answeredQuestions.map((row) => renderQuestions(row.questionPath))}
                        style={styles.title}
                        heightArr={[70, 70]}
                        textStyle={styles.text}
                    /> */}
                        <Col
                            data={answeredQuestions.map((row) => row.team)}
                            style={styles.title}
                            heightArr={[70, 70]}
                            // textStyle={styles.text}
                        />
                        <Col
                            data={answeredQuestions.map((row) => row.questionPath.length)}
                            style={styles.title}
                            heightArr={[70, 70]}
                            // textStyle={styles.text}
                        />

                    </TableWrapper>
                </Table>
                {/* <Modal animationType={"slide"} transparent={false} visible={imageVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>
                    <TouchableHighlight style={styles.touchableButton}
                        onPress={() => { setImageVisible(false) }}>
                        <Text style={styles.text}>exit</Text>
                    </TouchableHighlight>
                </Modal> */}
                <View style={{ marginTop: 100 }}>
                    <TouchableHighlight style={styles.touchableButton}
                        onPress={() => { props.setSummaryVisible(false) }}>
                        <Text style={styles.text}>Exit Summary</Text>
                    </TouchableHighlight>
                </View>
            </View>
            {/* </View> */}
        </Modal>
    )
}



const styles = StyleSheet.create({
    head: {
        height: 40,
        //backgroundColor: '#f1f8ff'
    },
    wrapper: {
        flexDirection: 'row'
    },
    title: {
        flex: 1,
        height: 70,
        backgroundColor: '#f6f8fa'
    },

    row: {
        height: 28
    },
    text: {
        textAlign: 'center'
    },
    questionDropdownButton: {
        backgroundColor: '#f6f8fa'
    },
    questionDropdownList: {
        backgroundColor: '#f6f8fa'
    },
    questionDropdownItem: {
        backgroundColor: '#f6f8fa'
    },
    modal: {

        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',

        width: 100,
        height: 100,

        margin: 50,
        marginTop: 200
    },
    container: {
        flex: 1,
        padding: 18,
        paddingTop: 100,
        marginBottom: 100,
        backgroundColor: '#ffffff'
    },
    HeadStyle: {
        height: 50,
        alignContent: "center",
        backgroundColor: '#ffe0f0'
    },
    TableText: {
        margin: 10
    }
});