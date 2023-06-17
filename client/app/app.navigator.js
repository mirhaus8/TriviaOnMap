import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { LoginScreen } from "./screen/login/login";
import { RegisterScreen } from "./screen/register/register";
import { SettingsScreen } from "./screen/settings/settings";
import { GroupSelection } from "./screen/GroupSelection/groupSelection";
import { Group } from "./components/Group";
import { TeamSelection } from "./screen/TeamSelection/teamSelection";
import { CreateGroup } from "./../app/components/CreateGroup";
import Map2 from './screen/map/map2';
import { authContext } from "./context/AuthContext";
import {UploadQuestion} from './screen/admin/uploadQuestions';
import {CreateTeams} from "./screen/GroupSelection/createTeams";
import { PickImages } from "./screen/admin/pickImages";
import { GameStatus } from "./screen/admin/gameStatus";

const { Navigator, Screen } = createStackNavigator();

function AppNavigator() {
    const { userToken } = useContext(authContext)
    return (
        <NavigationContainer>
            {userToken ?
            <Navigator headerShown="none" initialRouteName="GroupSelection">
                <Screen name="Login" component={LoginScreen}></Screen>
                
                <Screen name="Register" component={RegisterScreen}></Screen>
                <Screen name="Settings" component={SettingsScreen}></Screen>
                <Screen name="GroupSelection" component={GroupSelection}></Screen>
                <Screen name="Group" component={Group}></Screen>
                <Screen name="TeamSelection" component={TeamSelection}></Screen>
                <Screen name="CreateGroup" component={CreateGroup}></Screen>
                <Screen name="Map2" component={Map2}></Screen>
                <Screen name="UploadQuestion" component={UploadQuestion}></Screen>
                <Screen name="CreateTeams" component={CreateTeams}></Screen>
                <Screen name="PickImages" component={PickImages}></Screen>
                <Screen name="GameStatus" component={GameStatus}></Screen>

                </Navigator> :
                <Navigator headerShown="none" initialRouteName="Login">
                    <Screen name="Login" component={LoginScreen}></Screen>
                    <Screen name="Register" component={RegisterScreen}></Screen>
                    <Screen name="Settings" component={SettingsScreen}></Screen>
                    <Screen name="GroupSelection" component={GroupSelection}></Screen>
                    <Screen name="Group" component={Group}></Screen>
                    <Screen name="TeamSelection" component={TeamSelection}></Screen>
                    <Screen name="CreateGroup" component={CreateGroup}></Screen>
                    <Screen name="Map2" component={Map2}></Screen>
                    <Screen name="UploadQuestion" component={UploadQuestion}></Screen>
                    <Screen name="CreateTeams" component={CreateTeams}></Screen>
                    <Screen name="PickImages" component={PickImages}></Screen>
                    <Screen name="GameStatus" component={GameStatus}></Screen>

                </Navigator>}
        </NavigationContainer>
    );
}

export default AppNavigator;
