import {app, FrameContexts} from "@microsoft/teams-js";

export default class TeamsHelper {
    public static inTeams(): boolean {
        const currentUrl = window.location.href;
        // Check if using HistoryRouter
        const url = currentUrl.includes("/#/")
            ? new URL(`${window.location.href.split("/#/").join("/")}`)
            : new URL(window.location.href);
        const params = url.searchParams;
        return params.get("inTeams") === "true";
    }

    public static getAppContext(): FrameContexts | undefined {
        return app.getFrameContext();
    }
}
