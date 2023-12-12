import {LiveShareProvider} from "@microsoft/live-share-react";
import React, {PropsWithChildren, useState} from "react";
import {ILiveShareClientOptions, TestLiveShareHost} from "@microsoft/live-share";
import {InsecureTokenProvider} from "@fluidframework/test-client-utils";
import TeamsHelper from "../../helpers/TemsHelper";
import {LiveShareHost} from "@microsoft/teams-js";

const user = {id: "userId", name: "userName"};

const clientOptions: ILiveShareClientOptions = {
    connection: {
        type: "local",
        endpoint: "https://ankurs.ngrok.dev/",
        tokenProvider: new InsecureTokenProvider("myTenantKey", user),
    }
};

export default function LiveShareProviderApp(props: PropsWithChildren) {

    const [host] = useState(
        TeamsHelper.inTeams() ? LiveShareHost.create() : TestLiveShareHost.create()
    );

    return (
        <LiveShareProvider clientOptions={clientOptions} joinOnLoad={true} host={host}>
            {props.children}
        </LiveShareProvider>
    );
}
