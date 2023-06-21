import React, { useState, useContext } from 'react';
import { View, Image, StyleSheet, Modal, Text } from 'react-native';
import { Table, Row, Rows, Col, TableWrapper } from 'react-native-table-component';
import SelectDropdown from 'react-native-select-dropdown';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authContext } from '../../context/AuthContext';
import { Button } from "react-native-paper";
import socket from "../../../utils/socketio";


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
        }catch{}
    }


    const getAnsweredQuestions = async (gameName) => {
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://54.161.154.243/getAnsweredQuestions",
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

            setAnsweredQuestions(transformedAnsweredData)

        }
    }catch (error){
        if(error.response && error.response.data && error.response.data=="token invalid"){
            await getNewToken()
            await getAnsweredQuestions(gameName)
        }
    }
    }


    React.useLayoutEffect(() => {
        getAnsweredQuestions(props.gameName);
    }, []);
    React.useEffect(() => {
        getAnsweredQuestions(props.gameName);
    }, [socket]);

    

    return (
        <Modal animationType={"slide"} transparent={true} visible={props.summaryVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>
            <View style={styles.container}>
                

                <Table borderStyle={{ borderWidth: 1, borderColor: 'green' }}>
                    <Row data={['Username', 'Team', ' Number Questions answered']} style={styles.head} />
                    <TableWrapper style={styles.wrapper}>
                        <Col
                            data={answeredQuestions.map((row) => row.username)}
                            style={styles.title}
                            heightArr={[30, 30]}
                            
                        />
                        
                        <Col
                            data={answeredQuestions.map((row) => row.team)}
                            style={styles.title}
                            heightArr={[30, 30]}
                            
                        />
                        <Col
                            data={answeredQuestions.map((row) => row.questionPath.length)}
                            style={styles.title}
                            heightArr={[30, 30]}
                            
                        />

                    </TableWrapper>
                </Table>
                
                <View style={{ marginTop: 100 }}>
                            <Button onPress={() => { props.setSummaryVisible(false) }} style={{ color: 'green', backgroundColor: 'green' }} mode="contained"> Exit Summary</Button>
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
       
        height: 100,
        backgroundColor: '#f6f8fa',
        borderBottomWidth: 1, 
        borderColor: 'green'
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
        height: 250,

        margin: 50,
        marginTop: 10
    },
    container: {
        flex: 1,
        padding: 18,
        paddingTop: 100,
        marginBottom: 100,
        backgroundColor: '#ffffff',
        height:150
    },
    HeadStyle: {
        height: 50,
        alignContent: "center",
        backgroundColor: '#ffe0f0'
    },
    TableText: {
        margin: 10
    },
    touchableButton: {
        width: '70%',
        padding: 1,
        backgroundColor: 'green',
        marginBottom: 10,
        marginTop: 10,
    },
});