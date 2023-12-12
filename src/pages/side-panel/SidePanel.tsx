import {useSharedState} from "@microsoft/live-share-react";
import * as teams from "@microsoft/teams-js";
import {AppRoutes} from "../../constants";
import {LivePresenceUser} from "@microsoft/live-share";

interface RightPanelPageProps {
    id: string;
}

interface SidePanelProps {
    localUser: LivePresenceUser;
}

export function Counter(props: RightPanelPageProps) {
    const [count, setCount] = useSharedState<number>(`right-panel-count-${props.id}`, 0);
    return (
        <div style={{height: "100vh", width: "100vw"}}>Right Panel {count}
            <button onClick={() => setCount(c => c + 1)}>increment</button>
        </div>
    )
}


export default function SidePanel(props: SidePanelProps) {

    const {localUser} = props;

    const launchAppToStage = () => {
        teams.meeting.shareAppContentToStage(() => {
        }, `${window.location.origin}${AppRoutes.MainApp}?inTeams=true&userId=${localUser?.userId}`)
    }

    return (
        <>
            <button onClick={launchAppToStage}>launch app</button>
            {/*<Counter id="1"/>
            <Counter id="2"/>*/}
        </>
    )
}
