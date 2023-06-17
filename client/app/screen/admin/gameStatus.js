import React, { useContext } from 'react';
import MapView, { Marker, Geojson } from 'react-native-maps';
import { StyleSheet, View, Text, Modal, TouchableHighlight, Image, ScrollView} from 'react-native';
import * as Location from 'expo-location';
import { countries } from 'country-data';
import { List, MD3Colors ,TextInput} from 'react-native-paper';
import { convertIso2Code } from 'convert-country-codes';
import contriesData from './../../data/countries.json'

import { RadioButton } from 'react-native-paper';
const axios = require('axios');
import socket from "../../../utils/socketio";
import Geocoder from 'react-native-geocoder';
import { authContext } from '../../context/AuthContext';
var countriesC = require('country-data').countries
var lookup = require('country-data').lookup;
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';



export const GameStatus = (props) => {
    const { user, logout, userToken, userRefreshToken, setTokens } = useContext(authContext);

    const [states, setStates] = React.useState([]);
    const [rivalStates, setRivalStates] = React.useState([]);
    const [rivals, setRivals] = React.useState([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [start, setStart] = React.useState(false);
    const [questionPath, setQuestionPath] = React.useState("");
    const [showAlert, setShowAlert] = React.useState(false);
    const [showAlert2, setShowAlert2] = React.useState(false);
    const [showAlert3, setShowAlert3] = React.useState(false);
    const [showTeamName, setShowTeamName] = React.useState("");
    const [showWin, setShowWin] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const [imagee, setImagee] = React.useState("");
    const [endGame, setEndGame] = React.useState(false);
    const [sentToWinner, setSentToWinner] = React.useState(false);
    const [text, onChangeText] = React.useState('');
    const [answer, SetAnswer] = React.useState('');
    const [cntrName, setCntryName] = React.useState('');
    const [points, setPoints] = React.useState(0);
    //const [initialState, setInitialState] = React.useState(false);
    const [region, setregion] = React.useState({
        latitude: 55.988866327986244,
        longitude: 18.30947809345804,
        latitudeDelta: 34.3799,
        longitudeDelta: 34.3799
    });
    const [teamsTerritories, setTeamsTerritories] = React.useState([]);


    const ShowAlert = () => {
        setShowAlert(true);
        
    };

    const hideAlert = () => {
        setShowAlert(false);
    };
    const ShowAlert2 = () => {

        setShowAlert2(true);
    };

    const hideAlert2 = () => {
        setShowAlert2(false);
    };
    const ShowAlert3 = () => {
        setShowAlert3(true);
    };

    const hideAlert3 = () => {
        setShowAlert3(false);
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
           // console.log("responseOk refreshToken", response.status)
            let responseOK = response && response.status === 200;
            //console.log("responseOk refreshToken", responseOK)
            if (responseOK) {
              //  console.log("in get refresh token",response.data.accessToken)
                await setTokens(response.data.accessToken)
            }
        }catch{}
    }
 const getPolygons = async (cntry)=>{
    var countryISO = lookup.countries({ name: cntry["country"] })[0]["alpha3"];
    let countryPolygon = await getGeometry(countryISO)
    return countryPolygon;
}
    const getGeometry = async (iso) =>{
        
        let userToken =  await AsyncStorage.getItem('userToken');
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/getGeo",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Auth': userToken
            },
            data: {
                iso: iso,
                
            }
        };
        try{
            console.log("beforeee get  polygon from serverrrrrrr")
        let response = await axios(options);
        //console.log("after get  polygon from serverrrrrrr")
        let responseOK = response && response.status === 200;
        if (responseOK) {
            let data = await response.data;
            //console.log("geommmmetry from server", data)
            return data
        }
    }catch (error){
        if(error.response && error.response.data && error.response.data=="token invalid"){
            await getNewToken()
            await getGeometry()
        }
    }}

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

            for (let i = 0; i < territories.length; i++) {
                territories[i]["occupiedCountries"]["polygons"] = await Promise.all(territories[i]["occupiedCountries"].map(async (cntry)=>{
                    var countryISO = lookup.countries({ name: cntry["country"] })[0]["alpha3"];
                    let countryPolygon = contriesData["features"].find(stateObj => {
                        return stateObj["properties"]["ISO_A3"] === countryISO
                    })
                    return countryPolygon;
                }))
                territories[i]["occupiedCountries"]["names"] = territories[i]["occupiedCountries"].map(cntry=>{return cntry["country"] })
            }
            setTeamsTerritories(territories);
            //setInitialState(true);
            //return data["originCountries"]
        }
    }catch (error){
        //console.log("error in gameStatus", error)
        if(error && error.response && error.response.data && error.response.data=="token invalid"){
            await getNewToken()
            await getOriginsCountries()
        }
    }
    }

    const onAddCountryToTeam = async (x) => {
        var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
        let countryPolygon = contriesData["features"].find(stateObj => {
            return stateObj["properties"]["ISO_A3"] === countryISO
        })
        setTeamsTerritories(prevData => {
            // Find the index of the element with the specified name
            const index = prevData.findIndex(item => item.name === x["team"]);
            if (index !== -1) {
              // If the element is found, update its occupiedCo array
              const updatedElement = { ...prevData[index], 
                occupiedCountries:{
                    "polygons": [...prevData[index].occupiedCountries["polygons"], countryPolygon],
                    "names": [...prevData[index].occupiedCountries["names"], x["country"]],
                },
                color: prevData[index].color?prevData[index].color:x.color
            };
              return [...prevData.slice(0, index), updatedElement, ...prevData.slice(index + 1)];
            } else {
              // If the element is not found, add a new element to the state variable
              return [...prevData, { name:x["team"], color:x["color"], occupiedCountries: {"polygons": [countryPolygon], "names":[x["country"]] }}];
            }
          })
    }

    React.useEffect(()=>{
        socket.on("addedCountryToTeam", (x) => {
           onAddCountryToTeam(x)
        })
    })
    // React.useEffect(() => {
    //     socket.on("winner", (x) => {
    //         if (x == props.route.params.teamName) {
    //             setShowWin(true);
    //             console.log("in winner ", props.route.params.username);
    //             // if(!showAlert3)
    //             //     ShowAlert33();
    //             ShowAlert33()
    //         }
    //     })
    //     socket.on("lostCountries", (x) => {
    //         if (x["lostTeams"].includes(props.route.params.teamName)) {
    //             console.log("in loststs:'", x);
    //             if (x["winners"].length != 0 && x["winners"].length == 1) {
    //                 if (!sentToWinner){
    //                     socket.emit("sendToWinner", { gameName: props.route.params.gameName, winner: x["winners"][0] })
    //                     setSentToWinner(true)
    //                 }
    //             }
    //             ShowAlert2();
    //         }
    //     })
    //     socket.on("addedCountryToTeam", (x) => {
    //         console.log("hii im in socket addedCountryToTEam -129 - ")
    //         var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
    //         let countryPolygon = contriesData["features"].find(stateObj => {
    //             return stateObj["properties"]["ISO_A3"] === countryISO
    //         })
    //         if (x["team"] == props.route.params.teamName && !states.includes(countryPolygon)) {
    //             setStates([...states, countryPolygon]);
    //             setPoints(points+x["countryPoints"])
    //         }
    //         else {

    //             if (!rivalStates.includes(countryPolygon)) {
    //                 setRivalStates([...rivalStates, countryPolygon]);
    //                 //setRivals([...rivals, x["country"]])
    //             }

    //         }

    //     });
    //     return () => {
    //         socket.off("addedCountryToTeam");
    //         socket.off("lostCountries");
    //         socket.off("winner");
    //     }
    // })

    React.useLayoutEffect(() => {
        //console.log("hiii in useLayoutEffect4545454554")
        getOriginsCountries()
        // if (props.route.params.originCountry) {
        //     var countryISO = lookup.countries({ name: props.route.params.originCountry })[0]["alpha3"];
        //     let countryPolygon = contriesData["features"].find(stateObj => {
        //         return stateObj["properties"]["ISO_A3"] === countryISO
        //     })
        //     if (!states.includes(countryPolygon)) {
        //         setStates([...states, countryPolygon]);
        //         socket.emit("startGame", { gameName: props.route.params.gameName, originCountry: props.route.params.originCountry, occupiedCountry: props.route.params.originCountry })
        //     }
        // }
        setStart(true);
        


    },[])
    const toggleModal = (visible) =>{
        setModalVisible(visible);
    }

    

    const getQuestion = async (countryName) => {
        let options = {
            method: 'POST',
            url: "http://10.0.0.8:3001/isNeighborCountry",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {
                difficulty: "hard",
                originCountry:props.route.params.originCountry ? props.route.params.originCountry : "",
                teamName: props.route.params.teamName, 
                gameName:props.route.params.gameName,
                subject:"history",
                neighborCountry:countryName
            }
        };
        let response = await axios(options);
        let responseOK = response && response.status === 200;
        if (responseOK) {
            let data = await response.data;
            if(data.message == 'no'){
                
                ShowAlert();
                return false;
            }
            setQuestionPath(data.path );
            SetAnswer(data.answer);
            return true;
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
            <MapView style={styles.map} region={region}  scrollEnabled={false} userInterfaceStyle={'dark'} mapType={'hybrid'}
                onPress={async (e) => {
                    e.persist();  
                    let address = await Location.reverseGeocodeAsync(e.nativeEvent.coordinate, { lang: "en" });
                    var countryName = lookup.countries({alpha2: address[0]["isoCountryCode"]})[0]["name"];
                    const territory = teamsTerritories.find((item) =>
                        item.occupiedCountries.names.includes(countryName)
                    );
                    setShowTeamName(territory["name"])
                    ShowAlert3()
                    // setCntryName(countryName);
                    // //let countryName = address[0]["country"];
                    // let countryCode = convertIso2Code(address[0]["isoCountryCode"])["iso3"];
                    // //let countryName = convertIso2Code(address[0]["isoCountryCode"])["iso3"];
                    // let countryPolygon = contriesData["features"].find(stateObj => {
                    //     return stateObj["properties"]["ISO_A3"] === countryCode
                    // })
                    // //this.setState({markers: [...this.state.markers, { latlng: e.nativeEvent.coordinate }], states: [...this.state.states, countryPolygon] });
                    // //this.setState({markers: [...this.state.markers, { latlng: e.nativeEvent.coordinate }]});
                    // let legalCountry = await getQuestion(countryName)
                    // if(legalCountry){
                    //     toggleModal(!modalVisible)
                    //     // socket.emit("addCountryToTeam", { gameName: props.route.params.gameName, originCountry: props.route.params.originCountry, occupiedCountry: countryName }, (x, y) => {
                    //     //     var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
                    //     //     let countryPolygon = contriesData["features"].find(stateObj => {
                    //     //         return stateObj["properties"]["ISO_A3"] === countryISO
                    //     //     })
                    //     //     setStates([...states, countryPolygon]);
                    //     //     // if(y["winners"].length !=0 && y["winners"].length==1 && y["winners"].includes(props.route.params.originCountry)){
                    //     //     //     setEndGame( true)
                                
                    //     //     //     ShowAlert();
                    //     //     // }

                    //     // });
                    // }
                }}>
                {
                    // // loop through markers array & render all markers
                    // this.state.markers.map((marker, i) => (
                    //     <Marker coordinate={marker.latlng} key={i} />
                    // ))

                }
                { teamsTerritories.map((country, index) => {
                    
                        return (
                        <Geojson
                            key={index}
                            geojson={{
                                type: 'FeatureCollection',
                                features: country["occupiedCountries"]["polygons"]
                            }}
                            strokeColor="white"
                            fillColor={country.color}
                            strokeWidth={2}
                        />
                    )
                })}
                {/* <Geojson
                        geojson={{
                            type: 'FeatureCollection',
                            features: teamsTerritories[0]["occupiedCountries"]
                        }}
                        strokeColor="red"
                        fillColor={"blue"}
                        strokeWidth={2}
                    /> */}

                {/* <Geojson
                    geojson={{
                        type: 'FeatureCollection',
                        features: states
                    }}
                    strokeColor="red"
                    fillColor={"green"}
                    strokeWidth={2}
                />
                <Geojson
                    geojson={{
                        type: 'FeatureCollection',
                        features: rivalStates
                    }}
                    strokeColor="red"
                    fillColor= {"blue"}
                    strokeWidth={2}
                /> */}



            </MapView>
            {/* <AwesomeAlert
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
                    if(endGame){
                        props.navigation.navigate("GroupSelection",{username: props.route.params.username});
                    }
                }}
            /> */}
            
            {/* <AwesomeAlert
                show={showAlert2}
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
                    hideAlert2();
                }}
                onConfirmPressed={() => {
                    hideAlert2();
                    
                    props.navigation.navigate("Settings",{username: props.route.params.username});
                    
                }}
            /> */}
            
            
            <Modal animationType={"slide"} transparent={true} visible={modalVisible} onRequestClose={() => { console.log("Modal has been closed.") }}>

                <View style={styles.modal}>
                    <Image
                        style={{ width: '98%', height: 200, }}
                        source={{uri: questionPath}}
                    />

                    <TextInput style={styles.textI}
                        placeholder="Enter Your choice"
                        onChangeText={onChangeText}            
                     />

                    
                    <TouchableHighlight style={styles.touchableButton}
                        onPress={() => { 
                            // toggleModal(!modalVisible);
                            // if(text==answer){
                            //     socket.emit("addCountryToTeam", { gameName: props.route.params.gameName, teamName: props.route.params.teamName, occupiedCountry: cntrName }, (x, y) => {
                            //         console.log("hii im in socket addedCountryToTEam callback-340 - ")
                            //         var countryISO = lookup.countries({ name: x["country"] })[0]["alpha3"];
                            //         let countryPolygon = contriesData["features"].find(stateObj => {
                            //             return stateObj["properties"]["ISO_A3"] === countryISO
                            //         })
                            //         setStates([...states, countryPolygon]);
                            //         setPoints(points+x["countryPoints"])
                            //         // if(y["winners"].length !=0 && y["winners"].length==1 && y["winners"].includes(props.route.params.originCountry)){
                            //         //     setEndGame( true)
                                        
                            //         //     ShowAlert();
                            //         // }
        
                            //     });
                            //     if(showWin)
                            //         ShowAlert33()
                            // }
                            // if(showWin)
                            //     ShowAlert33()

                            }}>
                        <Text style={styles.text}>Submit</Text>
                    </TouchableHighlight>
                </View>
            </Modal>

            <AwesomeAlert
                show={showAlert3}
                showProgress={false}
                title="Territory Of Team:"
                message={showTeamName}
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


        </View>


    );

    

}

export default GameStatus;

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

        width: 300,
        height:300,

        margin: 50,
        marginTop: 200
    },
    text: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
    },
    textI:{
        width: 200,
        height:30,
        marginTop: 10,
    },
    touchableButton: {
        width: '70%',
        padding: 1,
        backgroundColor: '#f06292',
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






