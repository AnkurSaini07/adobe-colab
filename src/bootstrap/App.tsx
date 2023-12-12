import {BrowserRouter as Router, Route, Routes, useSearchParams} from "react-router-dom";
import {AppRoutes} from "../constants";
import AppConfig from "../pages/app-config";
import React from "react";
import LiveShareProviderApp from "../components/live-share-provider-app";
import TeamsHelper from "../helpers/TemsHelper";
import {FrameContexts} from "@microsoft/teams-js";
import Splash from "../components/splash";
import {useLivePresence} from "@microsoft/live-share-react";

const SidePanel = React.lazy(() => import('../pages/side-panel'));
const PdfViewer = React.lazy(() => import('../pages/pdf-viewer'));

function MainApp() {
    const [params] = useSearchParams();
    const {localUser} = useLivePresence("UNIQUE-PRESENCE-KEY");
    if (!localUser) {
        return <Splash>Loading app..., please wait.</Splash>
    }
    if (TeamsHelper.getAppContext() === FrameContexts.sidePanel) {
        return <SidePanel localUser={localUser}/>
    }
    if (TeamsHelper.getAppContext() === FrameContexts.meetingStage) {
        if (!params.has("userId")) {
            return <Splash>Click on "launch app" in side panel.</Splash>
        }
        return <PdfViewer localUser={localUser} organizerId={params.get("userId")} divId="pdf-viewer"/>
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
