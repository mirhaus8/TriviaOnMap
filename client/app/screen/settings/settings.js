import React from "react";
import { SafeAreaView, ScrollView, View, Dimensions, TouchableHighlight, FlatList, StyleSheet, Modal } from "react-native";
import { TextInput, Text, Switch, Button, Appbar, Title, RadioButton, Checkbox } from "react-native-paper";
import { HeaderComponent } from "../../components/header";
import { theme } from "../../../App.style";
import CountryPicker from 'rn-country-dropdown-picker';
import { SelectList } from 'react-native-dropdown-select-list';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import Icon from './../../components/Icon';
import ListItemSeparator from "../../components/ListItemSeparator";
import AppText from "../../components/AppText";
import socket from "../../../utils/socketio";



export const SettingsScreen = (props) => {

    function handleSelection(country) {
        onToggleCountry(country);
    }

    const [selected, setSelected] = React.useState("");
    const [lat, setLat] = React.useState("30.8124247");
    const [lng, setLng] = React.useState("34.8594762");
    const [selectedMultiple, setSelectedMultiple] = React.useState("");
    const [isSwitchOn, setIsSwitchOn] = React.useState(false);
    const onToggleSwitch = () => {setIsSwitchOn(!isSwitchOn); console.log(props)};
    const [isSwitchTimeOn, setIsSwitchTimeOn] = React.useState(false);
    const onToggleSwitchTime = () => setIsSwitchTimeOn(!isSwitchTimeOn);

    const [modalVisible, setModalVisible] = React.useState(false);
    const onToggleModal = () => setModalVisible(!modalVisible);

    const [originCountry, setOriginCountry] = React.useState("");
    const onToggleCountry = (country) => setOriginCountry(country);
    const data = [
        { key: '1', value: 'Easy' },
        { key: '2', value: 'Medium' },
        { key: '3', value: 'Hard' },
    ]

    const subjects = [
        { key: '1', value: 'math' },
        { key: '2', value: 'geometry' },
        { key: '3', value: 'history' }
    ]

    const messages = [{
        id: 1,
        title: "group",
        text: "Team Player",
        iconName: "group"
    },
    {
        id: 2,
        title: "time",
        text: "Limit Time",
        iconName: "timer"
    }
    ]

    // const play = () => props.navigation.navigate("Map", {latitude:lat, longitude:lng});
    const play = () => {
        socket.emit("joinToGame",{username: props.route.params.username});
        props.navigation.navigate("GroupSelection",{username: props.route.params.username, role: props.route.params.role});}

    async function handleSelection(e) {
        let response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=6b9a938129b8417282d43bd77be92109&q=${e["country"]}`);
        let json = await response.json();
        let countryLat = json.results[0].geometry["lat"]
        setLat(countryLat);
        let countryLng = json.results[0].geometry["lng"];
        setLng(countryLng);
    }

    return (
        <SafeAreaView>


            <View style={Styles.content}>

                {/* <View style={Styles.listItem}>
                    <Icon name="earth" />
                    <AppText style={Styles.text}> Select Origin Country</AppText>


                </View>
                <CountryPicker selectedItem={handleSelection} /> */}

                <View style={Styles.listItem}>
                    <Icon name="group" />
                    <View style={Styles.detailsContainer}>
                        <AppText style={Styles.text}>Team Player</AppText>
                    </View>
                    <View style={Styles.col2}>
                        <Switch
                            value={isSwitchOn}
                            onValueChange={onToggleSwitch} />
                    </View>

                </View>
                <ListItemSeparator />
                <View style={Styles.listItem}>
                    <Icon name="timer" />
                    <View style={Styles.detailsContainer}>
                        <AppText style={Styles.text}>Limit Time</AppText>
                    </View>
                    <View style={Styles.col2}>
                        <Switch
                            value={isSwitchTimeOn}
                            onValueChange={onToggleSwitchTime} />
                    </View>

                </View>
                <ListItemSeparator />
                <View style={Styles.listItem}>
                    <Icon name="skull" />
                    <View style={Styles.detailsContainer}>
                        <AppText style={Styles.text}>Difficulty</AppText>
                    </View>
                    <View style={Styles.selectList}>
                        <SelectList
                            setSelected={(val) => setSelected(val)}
                            data={data}
                            save="value"
                        />
                    </View>

                </View>
                <ListItemSeparator />

                <View style={Styles.listItem}>
                    <Icon name="book-multiple" />
                    <View style={Styles.detailsContainer}>
                        <AppText style={Styles.text}>Subjects</AppText>
                    </View>
                    <View style={Styles.selectList}>
                        <MultipleSelectList
                            setSelected={(val) => setSelectedMultiple(val)}
                            data={subjects}
                            save="value"

                            label="Categories"
                        />
                    </View>

                </View>
                <ListItemSeparator />

                <View style={{ marginTop: 90 }}>
                    <Button
                        onPress={play}
                        mode="contained">
                        Play
                    </Button>
                </View>
            </View>

        </SafeAreaView >
    )
}



const Styles = StyleSheet.create({
    content: {
        display: "flex",
        flexDirection: 'column',
    },
    icon: {
        color: theme.colors.primary
    },
    detailsContainer: {
        marginLeft: 10,
        marginTop: 7,
        marginRight: 20,
        flex: 0.8,

    },
    listItem: {
        flexDirection: "row",
        padding: 10,

    },
    selectList: {
        flex: 1.5
    },
    button: {
        margin: 5,
        marginLeft: 0,
        marginRight: 0
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
        backgroundColor: "rgb(209, 199, 214)"
    },
    col1: {
        color: theme.colors.primary,
        flex: 0.8,
    },
    col2: {
        flex: 0.2,
    },
    title: {
        fontSize: 20,
        color: "secondary",
    },
    text: {
        paddingTop: 30
    }
})






