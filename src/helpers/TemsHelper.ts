import * as teams from "@microsoft/teams-js";
import {app, FrameContexts} from "@microsoft/teams-js";
import {AppParams} from "../constants";

export default class TeamsHelper {
    public static getParams(): URLSearchParams {
        const currentUrl = window.location.href;
        // Check if using HistoryRouter
        const url = currentUrl.includes("/#/")
            ? new URL(`${window.location.href.split("/#/").join("/")}`)
            : new URL(window.location.href);
        return url.searchParams;
    }
    public static inTeams(): boolean {
        const params = this.getParams();
        return params.get(AppParams.IN_TEAMS) === "true";
    }

    public static getAppContext(): FrameContexts | undefined {
        if (!this.inTeams()) {
            return this.getParams().get(AppParams.FRAME_CONTEXT) as FrameContexts || undefined;
        }
        return app.getFrameContext();
    }

    public static launchAppInMeetingStage(path: string, params: URLSearchParams, hash: string) {
        if (!this.inTeams()) {
            params.set(AppParams.FRAME_CONTEXT, FrameContexts.meetingStage);
            params.set(AppParams.IS_ORGANIZER, "true")
            window.location.href = `${path}?${params.toString()}${hash}`;
        } else {
            teams.meeting.shareAppContentToStage(() => {
            }, `${path}?${params.toString()}${hash}`)
        }
    }

    public static isLocalUserOrganizer(organizerId: string, localUserId: string) {
        const params = this.getParams();
        if (!this.inTeams()) {
            return params.get(AppParams.IS_ORGANIZER);
        }
        return organizerId === localUserId
    }
}
