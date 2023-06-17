import React, { useContext, useRef} from 'react';
import MapView, { Marker, Geojson } from 'react-native-maps';
import { StyleSheet, View, Text, Modal, TouchableHighlight, Image,Dimensions, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { countries } from 'country-data';
import { List, MD3Colors, TextInput } from 'react-native-paper';
import { convertIso2Code } from 'convert-country-codes';
import contriesData from './../../data/countries.json'

import { MyContext } from "../../context/QuestionsContext";
import { RadioButton } from 'react-native-paper';
const axios = require('axios');
import socket from "../../../utils/socketio";
import Geocoder from 'react-native-geocoder';
import { authContext } from '../../context/AuthContext';
var countriesC = require('country-data').countries
var lookup = require('country-data').lookup;
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';



export const Map2 = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);
    

    const [states, setStates] = React.useState([]);
    const [rivalStates, setRivalStates] = React.useState([]);
    const [rivals, setRivals] = React.useState([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [start, setStart] = React.useState(false);
    const [questionPath, setQuestionPath] = React.useState("");
    const [showAlert, setShowAlert] = React.useState(false);
    const [showAlertLost, setShowAlertLost] = React.useState(false);
    const [showAlertWin, setShowAlertWin] = React.useState(false);
    const [showAlertMissing, setShowAlertMissing] = React.useState(false);
    const [showAlertQuestion, setShowAlertQuestion] = React.useState(false);
    const [showAlertWrong, setShowAlertWrong] = React.useState(false);

    const [showWin, setShowWin] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const [imagee, setImagee] = React.useState("");
    const [endGame, setEndGame] = React.useState(false);
    const [sentToWinner, setSentToWinner] = React.useState(false);
    const [text, onChangeText] = React.useState('');
    const [answer, SetAnswer] = React.useState('');
    const [cntrName, setCntryName] = React.useState('');
    const [points, setPoints] = React.useState(0);
    const [color, setColor] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(60);
    const { deletedGames, setDeletedGames } = useContext(MyContext);
    const prevDeletedGames = useRef(deletedGames);
    const [startTime, setStartTime] = React.useState(false);
    const [region, setRegion] = React.useState({
        latitude: 55.988866327986244,
        longitude: 18.30947809345804,
        latitudeDelta: 34.3799,
        longitudeDelta: 34.3799
    });
    const EuropeBounds = {
        northEast: {
          latitude: 72.71,
          longitude: 37.89,
        },
        southWest: {
          latitude: 34.01,
          longitude: -19.79,
        },
      };
      const [teamsTerritories, setTeamsTerritories] = React.useState([]);



      const handleRegionChange = (newRegion) => {
        // Check if the new region is within the boundaries of Europe
        const inBounds =
          newRegion.latitude > EuropeBounds.southWest.latitude &&
          newRegion.latitude < EuropeBounds.northEast.latitude &&
          newRegion.longitude > EuropeBounds.southWest.longitude &&
          newRegion.longitude < EuropeBounds.northEast.longitude;
    
        if (inBounds) {
            //console.log("in boundddssss", newRegion)
          setRegion(newRegion);
        }
        else{
            setRegion(region);
        }
      };

    const ShowAlert = () => {
        setShowAlert(true);

    };

    const hideAlert = () => {
        setShowAlert(false);
    };


    const ShowAlertLost = () => {

        setShowAlertLost(true);
    };

    const hideAlertLost = () => {
        setShowAlertLost(false);
    };
    const ShowAlertWrong = () => {

        setShowAlertWrong(true);
    };

    const hideAlertWrong = () => {
        setShowAlertWrong(false);
    };
    const ShowAlertWin = () => {
        setShowAlertWin(true);
    };

    const hideAlertWin = () => {
        setShowAlertWin(false);
    };

    const ShowAlertMissing = () => {
        setShowAlertMissing(true);

    };

    const hideAlertMissing = () => {
        setShowAlertMissing(false);
    };

    const ShowAlertQuestion = () => {
        setShowAlertQuestion(true);

    };

    const hideAlertQuestion = () => {
        setShowAlertQuestion(false);
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
              //  console.log("in get refresh token",response.data.accessToken)
                await setTokens(response.data.accessToken)
            }
        }catch{}
    }

    const onDialogPress = async () =>{
            toggleModal(!modalVisible);
            if (text == answer) {
                socket.emit("addCountryToTeam", { questionPath:questionPath, 
                    username: props.route.params.username,
                    gameName: props.route.params.gameName,
                    teamName: props.route.params.teamName,
                    occupiedCountry: cntrName }, 
                    async (x, y) => {
                        console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", x.color, x.team)
                        
                        var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
                        let countryPolygon = contriesData["features"].find(stateObj => {
                            return stateObj["properties"]["ISO_A3"] === countryISO
                        })
                        //let countryPolygon = await getGeometry(countryISO)
                        //setStates([...states, countryPolygon]);

                        setTeamsTerritories(prevData => {
                            // Find the index of the element with the specified name
                            const index = prevData.findIndex(item => item.name == x.team);
                            if (index !== -1) {
                            // If the element is found, update its occupiedCo array
                            const updatedElement = { ...prevData[index],
                                occupiedCountries:[...prevData[index].occupiedCountries, countryPolygon],
                                teamPoints: prevData[index].teamPoints+ x.countryPoints,
                                color: prevData[index].color?prevData[index].color:x.color};
                            return [...prevData.slice(0, index), updatedElement, ...prevData.slice(index + 1)];
                            } else {
                            // If the element is not found, add a new element to the state variable
                            return [...prevData, { name:x.team, color:x.color, occupiedCountries: [countryPolygon], teamPoints: x.countryPoints}];
                            }
                        })
                        //setColor(x.color)

                    //console.log("statessssss", states)
                    // setPoints(points + x["countryPoints"])
                    // if (!color) {
                    //   //  console.log("hii colooorrrr - ", color, x["color"])
                    //     setColor(x["color"])
                    // }
                    // if(y["winners"].length !=0 && y["winners"].length==1 && y["winners"].includes(props.route.params.originCountry)){
                    //     setEndGame( true)

                    //     ShowAlert();
                    // }

                });
                if (showWin)
                    ShowAlertWin()
            }
            else{
                ShowAlertWrong()
                socket.emit("addWrongAnswerToTeam", { questionPath:questionPath, username: props.route.params.username, gameName: props.route.params.gameName, teamName: props.route.params.teamName }, (x, y) => {
                    ShowAlertLost();
                })
            }
            // if(showWin)
            //     ShowAlert33()

        }
    

    // const getGeometry = async (iso) =>{
        
    //     let userToken =  await AsyncStorage.getItem('userToken');
    //     let options = {
    //         method: 'POST',
    //         url: "http://10.0.0.8:3001/getGeo",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json;charset=UTF-8',
    //             'Auth': userToken
    //         },
    //         data: {
    //             iso: iso,
                
    //         }
    //     };
    //     try{
    //         console.log("beforeee get  polygon from serverrrrrrr")
    //     let response = await axios(options);
    //     //console.log("after get  polygon from serverrrrrrr")
    //     let responseOK = response && response.status === 200;
    //     if (responseOK) {
    //         let data = await response.data;
    //         //console.log("geommmmetry from server", data)
    //         return data
    //     }
    // }catch (error){
    //     if(error.response && error.response.data && error.response.data=="token invalid"){
    //         await getNewToken()
    //         await getGeometry()
    //     }
    // }}


    const onAddedCountryToTeam = async (x)=>{
        var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
        let countryPolygon = contriesData["features"].find(stateObj => {
            return stateObj["properties"]["ISO_A3"] === countryISO
        })
        //let countryPolygon = await getGeometry(countryISO)
        setTeamsTerritories(prevData => {
            // Find the index of the element with the specified name
            const index = prevData.findIndex(item => item.name === x.team);
            if (index !== -1) {
              // If the element is found, update its occupiedCo array
              const updatedElement = { ...prevData[index],
                 occupiedCountries:[...prevData[index].occupiedCountries, countryPolygon],
                 teamPoints: prevData[index].teamPoints+ x.countryPoints,
                 color: prevData[index].color?prevData[index].color:x.color};
              return [...prevData.slice(0, index), updatedElement, ...prevData.slice(index + 1)];
            } else {
              // If the element is not found, add a new element to the state variable
              return [...prevData, { name:x.team, color:x.color, occupiedCountries: [countryPolygon], teamPoints: x.countryPoints}];
            }
          })
    }

    // const onAddedCountryToTeam = async (x)=>{
    //     var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
    //     let countryPolygon = await getGeometry(countryISO)
    //     if (x["team"] == props.route.params.teamName && !states.includes(countryPolygon)) {
    //         setStates([...states, countryPolygon]);
    //         setPoints(points + x["countryPoints"])
    //         if (!color) {
    //            // console.log("hii colooorrrr - ", color)
    //             setColor(x["color"])
    //         }
    //     }
    //     else {

    //         if (!rivalStates.includes(countryPolygon)) {
    //             //setRivalStates([...rivalStates, countryPolygon]);

    //             setRivalStates(prevData => {
    //                 const index = prevData.findIndex(item => item.name === x["team"]);
    //                 if (index !== -1) {
    //                     const updatedElement = { ...prevData[index], occupiedCountries: [...prevData[index].occupiedCountries, countryPolygon] };
    //                     return [...prevData.slice(0, index), updatedElement, ...prevData.slice(index + 1)];
    //                 } else {
    //                     return [...prevData, { name: x["team"], color: x["color"], occupiedCountries: [countryPolygon] }];
    //                 }
    //             })


    //             //setRivals([...rivals, x["country"]])
    //         }

    //     }
    // }

    

    const getOriginsCountries = async () => {
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/getTerritories",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                gameName: props.route.params.gameName,
                role:props.route.params.role
            }
        };
        try{
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        if (responseOK) {
            let data = await response.data;

            let usedCountries = []
            let territories = data["teamsTerritories"]

            for (let i = 0; i < territories.length && territories[i]["occupiedCountries"].length>0; i++) {
                territories[i]["occupiedCountries"] = await Promise.all(territories[i]["occupiedCountries"].map(async (cntry)=>{
                    var countryISO = lookup.countries({ name: cntry["country"] })[0]["alpha3"];
                    //console.log("ISEEEEEPOOOOOOOOOO", countryISO)
                    let countryPolygon = contriesData["features"].find(stateObj => {
                        return stateObj["properties"]["ISO_A3"] === countryISO
                    })
                    //let countryPolygon = await getGeometry(countryISO)
                    //console.log("POOOLLLLLYYYGOGOGOGNGNGGNNGNG", countryPolygon)
                    return countryPolygon;
                }))
                //territories[i]["occupiedCountries"]["names"] = territories[i]["occupiedCountries"].map(cntry=>{return cntry["country"] })
            }
            //console.log("territtttttttttt", territories)
            setTeamsTerritories(territories);
        }}
        catch (error){
            if(error.response && error.response.data && error.response.data=="token invalid"){
                await getNewToken()
                await getOriginsCountries()
            }
        }
    }
   
    const onUseLayoutEffect = async () =>{
        getOriginsCountries()
        // if (props.route.params.originCountry) {
        //     var countryISO = lookup.countries({ name: props.route.params.originCountry })[0]["alpha3"];
        //     let countryPolygon = await getGeometry(countryISO)
        //     if (!states.includes(countryPolygon)) {
        //         setStates([...states, countryPolygon]);
        //         socket.emit("startGame", { gameName: props.route.params.gameName, originCountry: props.route.params.originCountry, occupiedCountry: props.route.params.originCountry })
        //     }
        // }
        // setStart(true);

    }

    React.useEffect(() => {

        if (prevDeletedGames.current !== deletedGames) {
            //console.log("prevvvvvvvvvvvvvvv", prevDeletedGames, deletedGames)

            prevDeletedGames.current = deletedGames;
            props.navigation.navigate("Login",{school:props.route.params.school, username: props.route.params.username, role:"student"})

          }
        
          

        if (startTime) {
            const timer = setTimeout(() => {
                if (timeLeft > 0) {
                    setTimeLeft(timeLeft - 1);
                }
                else{
                    socket.emit("addWrongAnswerToTeam", { questionPath:questionPath, username: props.route.params.username, gameName: props.route.params.gameName, teamName: props.route.params.teamName }, (x, y) => {
                        ShowAlertLost();
                    })
                   // console.log("timeLeft", timeLeft, modalVisible)
                    toggleModal(!modalVisible)
                }
            }, 1000);
        }
        socket.on("winner", (x) => {
            if (x == props.route.params.teamName) {
                setShowWin(true);
                // if(!showAlert3)
                //     ShowAlert33();
                ShowAlertWin()
            }
        })
        socket.on("lostCountries", (x) => {
            if (x["lostTeams"].includes(props.route.params.teamName)) {
                if (x["winners"].length != 0 && x["winners"].length == 1) {
                    if (!sentToWinner) {
                        socket.emit("sendToWinner", { gameName: props.route.params.gameName, winner: x["winners"][0] })
                        setSentToWinner(true)
                    }
                }
                ShowAlertLost();
            }
        })
        socket.on("stopedGame", (x) => {
            if (x["lostTeams"].includes(props.route.params.teamName)) {
                // if (x["winners"].length != 0 && x["winners"].length == 1) {
                //     if (!sentToWinner) {
                //         socket.emit("sendToWinner", { gameName: props.route.params.gameName, winner: x["winners"][0] })
                //         setSentToWinner(true)
                //     }
                // }
                ShowAlertLost();
            }
            if (x["winners"].includes(props.route.params.teamName)) {
                ShowAlertWin()
            }
        })
        socket.on("addedCountryToTeam",  (x) => {

           onAddedCountryToTeam(x)

        });
        return () => {
            socket.off("addedCountryToTeam");
            socket.off("lostCountries");
            socket.off("winner");
        }
    })

    React.useLayoutEffect( () => {
        //console.log("rivvaaaakkkkkllll", rivalStates, states)
        onUseLayoutEffect()

    }, [])
    const toggleModal = (visible) => {
        setStartTime(!startTime);

        // if(!startTime){
        //     setTimeLeft(5)
        // }
        setModalVisible(visible);
    }



    const getQuestion = async (countryName) => {
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/isNeighborCountry",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                role:props.route.params.role,
                difficulty: "easy",
                originCountry: props.route.params.originCountry ? props.route.params.originCountry : "",
                teamName: props.route.params.teamName,
                gameName: props.route.params.gameName,
                subject: "math",
                neighborCountry: countryName
            }
        };
        try{
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        if (responseOK) {
            let data = await response.data;
            if (data.message == 'no') {

                ShowAlert();
                return false;
            }
            else if (data.message == 'wait for the teacher to start game') {

                ShowAlertMissing();
                return false;
            } else if(data.message =='no questions left'){
                ShowAlertQuestion()
            }
            else{

            setQuestionPath(data.path);
            SetAnswer(data.answer);
            return true;
            }
        }
    }catch (error){
       // console.log("errror", error)
            if (error.response) {
                if (error.response && error.response.data == "token invalid") {
                    await getNewToken()
                    await getQuestion()
                }
            }
            else {
             //   console.log(error.response)
            }
    }
    }

    return (
        <View style={styles.container} >
            {/* <Text>points: {points}</Text> */}
            <View style={{height: 40, display: "flex", flexDirection: 'row',}}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                >
                <View style={styles.teamContainer}>
                <Text style={styles.teamName}>Teams Points: </Text>
                    </View>    
                {teamsTerritories.map((team) => (
                    <View key={team.name} style={styles.teamContainer}>
                    <Text style={[styles.teamName, { color: team.color }]}>{team.name}: </Text>
                    <Text style={[styles.teamPoints, { color: team.color }]}>{team.teamPoints}</Text>
                    </View>
                ))}
            </ScrollView>
            </View>
            <MapView style={styles.map} region={region} scrollEnabled={false}  userInterfaceStyle={'dark'} mapType={'hybrid'}
  
                onPress={async (e) => {
                    setTimeLeft(5)
                    e.persist();
                    let address = await Location.reverseGeocodeAsync(e.nativeEvent.coordinate, { lang: "en" });
                    var countryName = lookup.countries({ alpha2: address[0]["isoCountryCode"] })[0]["name"];
                    setCntryName(countryName);
                    //let countryName = address[0]["country"];
                    let countryCode = convertIso2Code(address[0]["isoCountryCode"])["iso3"];
                    //let countryName = convertIso2Code(address[0]["isoCountryCode"])["iso3"];
                    //let countryPolygon = getGeometry(countryCode)
                    //this.setState({markers: [...this.state.markers, { latlng: e.nativeEvent.coordinate }], states: [...this.state.states, countryPolygon] });
                    //this.setState({markers: [...this.state.markers, { latlng: e.nativeEvent.coordinate }]});
                    let legalCountry = await getQuestion(countryName)
                    if (legalCountry) {
                        toggleModal(!modalVisible)
                        // socket.emit("addCountryToTeam", { gameName: props.route.params.gameName, originCountry: props.route.params.originCountry, occupiedCountry: countryName }, (x, y) => {
                        //     var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
                        //     let countryPolygon = contriesData["features"].find(stateObj => {
                        //         return stateObj["properties"]["ISO_A3"] === countryISO
                        //     })
                        //     setStates([...states, countryPolygon]);
                        //     // if(y["winners"].length !=0 && y["winners"].length==1 && y["winners"].includes(props.route.params.originCountry)){
                        //     //     setEndGame( true)

                        //     //     ShowAlert();
                        //     // }

                        // });
                    }
                }}>
                {
                    // // loop through markers array & render all markers
                    // this.state.markers.map((marker, i) => (
                    //     <Marker coordinate={marker.latlng} key={i} />
                    // ))

                }





                {/* {color ? <Geojson
                    geojson={{
                        type: 'FeatureCollection',
                        features: states
                    }}
                    strokeColor="white"
                    fillColor={color}
                    strokeWidth={2}
                /> : ""} */}




                {/* <Geojson
                    geojson={{
                        type: 'FeatureCollection',
                        features: rivalStates
                    }}
                    strokeColor="red"
                    fillColor= {"blue"}
                    strokeWidth={2}
                /> */}




                {/* {rivalStates.map(country => {
                    //console.log("countrrryyryryryryryryryry", typeof(country))
                    return (
                        <Geojson
                            geojson={{
                                type: 'FeatureCollection',
                                features: country["occupiedCountries"]
                            }}
                            strokeColor="white"
                            fillColor={country.color}
                            strokeWidth={2}
                        />
                    )
                })} */}


            { teamsTerritories.map((country, index) =>{
                    if (country["occupiedCountries"] && country["occupiedCountries"].length > 0) {
                        console.log("lengthhhhhhhhhhhhh colooooorrrr", country.color, country["occupiedCountries"].length, country.name, country.name)
                        return (
                            <Geojson
                                key={index}
                                geojson={{
                                    type: 'FeatureCollection',
                                    features: country["occupiedCountries"]
                                }}
                                strokeColor="white"
                                fillColor={country.color}
                                strokeWidth={2}
                            />
                        )
                    }
            } 
            )}     



            </MapView>
            <AwesomeAlert
                show={showAlert}
                showProgress={false}
                title="not neighbor country or it's already occupied"
                message="please choose other country"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlert();
                }}
                onConfirmPressed={() => {
                    hideAlert();
                    if (endGame) {
                        props.navigation.navigate("GroupSelection", { username: props.route.params.username });
                    }
                }}
            />

            <AwesomeAlert
                show={showAlertLost}
                showProgress={false}
                title="You Lost 😔"
                message="Try Again"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlertLost();
                }}
                onConfirmPressed={() => {
                    hideAlertLost();
                  //  console.log("hiiiii before call fetch groups in map2222")
                    setDeletedGames((prevDeletedGames) => [...prevDeletedGames, props.route.params.gameName]);
                 //   console.log("deletedGameeesssssssssLooooosssssstttttt", deletedGames)

                    // props.route.params.fetchGroups()
                    //props.navigation.navigate("Settings", { username: props.route.params.username });
                    // props.navigation.navigate("GroupSelection",{school:props.route.params.school, username: props.route.params.username, role:"student"})

                }}
            />

            <AwesomeAlert
                show={showAlertMissing}
                showProgress={false}
                title="Game Not Started Yet"
                message="Please Wait"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlertMissing();
                }}
                onConfirmPressed={() => {
                    hideAlertMissing();

                    

                }}
            />

            <AwesomeAlert
                show={showAlertQuestion}
                showProgress={false}
                title="Not Question Left"
                message="Please Wait For The Teacher To Add Some"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlertQuestion();
                }}
                onConfirmPressed={() => {
                    hideAlertQuestion();

                    

                }}
            />
            <AwesomeAlert
                show={showAlertWrong}
                showProgress={false}
                title="Wrong Answer"
                message=""
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlertWrong();
                }}
                onConfirmPressed={() => {
                    hideAlertWrong();

                    

                }}
            />

            {/* {timeLeft === 0 ? (
                <Text>Time's up!</Text>
            ) : ( */}
                <Modal animationType={"slide"} transparent={true} visible={modalVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>

                    <View style={styles.modal}>
                        <Text style={{ color: 'red' }}>{timeLeft} seconds left</Text>
                        <Image
                            style={{ display: "flex", flex: 1, width: '98%', height: 300,  width: 300, resizeMode: 'contain'}}
                            source={{ uri: questionPath }}
                        />

                        <TextInput style={styles.textI}
                            placeholder="Enter Your choice"
                            onChangeText={onChangeText}
                        />


                        <TouchableHighlight style={styles.touchableButton}
                            onPress={ onDialogPress}>
                                <View>
                            <Text style={styles.text}>Submit</Text>
                            
                            </View>
                        </TouchableHighlight>
                    </View>
                </Modal>
                {/* )} */}

            <AwesomeAlert
                show={showAlertWin}
                showProgress={false}
                title="Congratulations 🎉"
                message="You Won 🎊"
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                cancelText="No, cancel"
                confirmText="Got it"
                confirmButtonColor="green"
                onCancelPressed={() => {
                    hideAlertWin();
                }}
                onConfirmPressed={() => {
                    hideAlertWin();
                    socket.emit("deleteGame", { gameName: props.route.params.gameName })
                    //props.navigation.navigate("Settings", { username: props.route.params.username });
                    // props.route.params.fetchGroups()
                    setDeletedGames((prevDeletedGames) => [...prevDeletedGames, props.route.params.gameName]);
                  //  console.log("deletedGameeesssssssss", deletedGames)
                    // props.navigation.navigate("GroupSelection",{school:props.route.params.school, username: props.route.params.username, role:"student"})

                }}
            />


        </View>


    );



}

export default Map2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    modal: {

        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',

        width: (Dimensions.get('window').width),
        height: (Dimensions.get('window').height)/2,
        alignSelf: 'center',
        
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    text: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
    },
    textI: {
        width: 200,
        height: 30,
        marginTop: 10,
    },
    touchableButton: {
        width: '70%',
        padding: 1,
        backgroundColor: 'green',
        marginBottom: 10,
        marginTop: 10,
    },
    teamContainer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        display: "flex", flexDirection: 'row',
      },
      teamName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      teamPoints: {
        fontSize: 14,
      },
});






