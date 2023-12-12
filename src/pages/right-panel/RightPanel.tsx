import {useLivePresence, useSharedState} from "@microsoft/live-share-react";
import PdfViewer from "../../components/pdf-viewer";

interface RightPanelPageProps {
    id: string;
}

export function RightPanelPage(props: RightPanelPageProps) {
    const [count, setCount] = useSharedState<number>(`right-panel-count-${props.id}`, 0);
    return (
        <div style={{height: "100vh", width: "100vw"}}>Right Panel {count}
            <button onClick={() => setCount(c => c + 1)}>increment</button>
        </div>
    )
}


export default function RightPanel() {
    const {localUser, allUsers, updatePresence} = useLivePresence("UNIQUE-PRESENCE-KEY");
    return (
        <>
            {/*<PdfViewer id="shared-viewer" userId={localUser?.userId}/>*/}
            <RightPanelPage id="1"/>
            <RightPanelPage id="2"/>
        </>
    )
}
