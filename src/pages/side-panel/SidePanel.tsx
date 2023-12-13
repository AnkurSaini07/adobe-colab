import {useSharedState} from "@microsoft/live-share-react";
import {AppParams, AppRoutes} from "../../constants";
import {LivePresenceUser} from "@microsoft/live-share";
import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";
import TeamsHelper from "../../helpers/TemsHelper";

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
    const [params] = useSearchParams();

    const launchAppToStage = useCallback(() => {
        params.set(AppParams.USER_ID, localUser.userId);
        TeamsHelper.launchAppInMeetingStage(`${window.location.origin}${AppRoutes.MainApp}`, params, window.location.hash);

    }, [params, localUser]);

    return (
        <>
            <button onClick={launchAppToStage}>launch app</button>
            {/*<Counter id="1"/>
            <Counter id="2"/>*/}
        </>
    )
}
