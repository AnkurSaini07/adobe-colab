import {BrowserRouter as Router, Route, Routes, useSearchParams} from "react-router-dom";
import {AppParams, AppRoutes} from "../constants";
import AppConfig from "../pages/app-config";
import React from "react";
import LiveShareProviderApp from "../components/live-share-provider-app";
import TeamsHelper from "../helpers/TemsHelper";
import {FrameContexts} from "@microsoft/teams-js";
import Splash from "../components/splash";
import {useLivePresence} from "@microsoft/live-share-react";
import SidePanel from "../pages/side-panel";
import PdfViewer from "../pages/pdf-viewer";

function MainApp() {
    const [params] = useSearchParams();
    const {localUser, allUsers} = useLivePresence("UNIQUE-PRESENCE-KEY");
    if (!localUser) {
        return <Splash>Loading app..., please wait.</Splash>
    }
    if (TeamsHelper.getAppContext() === FrameContexts.sidePanel) {
        return <SidePanel localUser={localUser}/>
    }
    if (TeamsHelper.getAppContext() === FrameContexts.meetingStage) {
        if (!params.has(AppParams.USER_ID)) {
            return <Splash>Click on "launch app" in side panel.</Splash>
        }
        return <PdfViewer localUser={localUser}
                          allUsers={allUsers}
                          organizerId={params.get(AppParams.USER_ID)}
                          divId="pdf-viewer"/>
    }
}

export default function App() {

    return (
        <Router window={window} basename="/">
            <Routes>
                <Route path={AppRoutes.AppConfig} element={<AppConfig/>}/>
                <Route path={AppRoutes.MainApp} element={
                    <LiveShareProviderApp>
                        <MainApp/>
                    </LiveShareProviderApp>
                }/>
            </Routes>
        </Router>
    )
}
