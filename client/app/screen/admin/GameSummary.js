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

    const renderQuestions = (questions) => {
        return (
            <View>
                
                {dropVisible ? <SelectDropdown

                    data={questions.map(file => file.fileName)}
                    onSelect={(selectedItem, index) => {
                    
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
            <View style={styles.container}>
                

                <Table borderStyle={{ borderWidth: 1, borderColor: '#ffa1d2' }}>
                    <Row data={['Username', 'Team', ' Number Questions answered']} style={styles.head} />
                    <TableWrapper style={styles.wrapper}>
                        <Col
                            data={answeredQuestions.map((row) => row.username)}
                            style={styles.title}
                            heightArr={[70, 70]}
                            // textStyle={styles.text}
                        />
                        
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