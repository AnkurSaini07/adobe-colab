import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {AppRoutes} from "../constants";
import AppConfig from "../pages/app-config";
import React, {useState} from "react";
import TeamsHelper from "../helpers/TemsHelper";
import {LiveShareHost} from "@microsoft/teams-js";
import {ILiveShareClientOptions, TestLiveShareHost} from "@microsoft/live-share";
import {LiveShareProvider} from "@microsoft/live-share-react";

const RightPanel = React.lazy(() => import('../pages/right-panel'));

const clientOptions: ILiveShareClientOptions = {
    connection: {
        type: "remote",
        endpoint: "https://76f87e58cc65.ngrok.app/"
    }
};

export default function App() {

    const [host] = useState(
        TeamsHelper.inTeams() ? LiveShareHost.create() : TestLiveShareHost.create()
    );

    return (
        <Router window={window} basename="/">
            <Routes>
                <Route path={AppRoutes.AppConfig} element={<AppConfig/>}/>
                <Route path={AppRoutes.RightPanel} element={
                    <LiveShareProvider clientOptions={clientOptions} joinOnLoad={true} host={host}>
                        <RightPanel/>
                    </LiveShareProvider>
                }/>
            </Routes>
        </Router>
    )
}
