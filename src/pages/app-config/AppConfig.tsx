import {useEffect} from "react";
import {pages} from "@microsoft/teams-js";
import TeamsHelper from "../../helpers/TemsHelper";
import {AppRoutes} from "../../constants";
import {useNavigate} from "react-router";

const IN_TEAMS = TeamsHelper.inTeams();

export default function AppConfig() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!IN_TEAMS) {
            navigate({
                pathname: AppRoutes.MainApp,
                search: "?inTeams=false"
            })
            return;
        }
        pages.config.registerOnSaveHandler(function (saveEvent) {
            pages.config.setConfig({
                suggestedDisplayName: "Acrobat LiveShare",
                contentUrl: `${window.location.origin}${AppRoutes.MainApp}?inTeams=true`,
            });
            saveEvent.notifySuccess();
        });
        pages.config.setValidityState(true);
    }, []);

    return (
        <div>Acrobat Live Share</div>
    )
}
