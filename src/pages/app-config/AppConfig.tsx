import {useEffect} from "react";
import {FrameContexts, pages} from "@microsoft/teams-js";
import TeamsHelper from "../../helpers/TemsHelper";
import {AppParams, AppRoutes} from "../../constants";
import {useNavigate} from "react-router";

const IN_TEAMS = TeamsHelper.inTeams();

export default function AppConfig() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams();
        params.set(AppParams.IN_TEAMS, IN_TEAMS.toString());
        if (!IN_TEAMS) {
            params.set(AppParams.FRAME_CONTEXT, FrameContexts.sidePanel);
            navigate({
                pathname: AppRoutes.MainApp,
                search: `?${params.toString()}`
            })
            return;
        }
        pages.config.registerOnSaveHandler(function (saveEvent) {
            pages.config.setConfig({
                suggestedDisplayName: "Acrobat LiveShare",
                contentUrl: `${window.location.origin}${AppRoutes.MainApp}?${params.toString}`,
            });
            saveEvent.notifySuccess();
        });
        pages.config.setValidityState(true);
    }, []);

    return (
        <div>Acrobat Live Share</div>
    )
}
