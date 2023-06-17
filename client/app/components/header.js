import React from "react";
import { Appbar } from "react-native-paper";

export const HeaderComponent = (props) => {
    const goBack = () => props.navigation?.goBack();

    return (
        <Appbar>
            <Appbar.BackAction
                onPress={goBack} />
            <Appbar.Content title={props.title} />
        </Appbar>
    )
}