import {useSharedState} from "@microsoft/live-share-react";
import {LivePresenceUser} from "@microsoft/live-share";
import {useEffect} from "react";

type Session = { state: "pending" | "completed", userId: any } | undefined;

interface UseSharedCommentingProps {
    divId: string;
    user: LivePresenceUser;
}

export default function useSharedCommenting(props: UseSharedCommentingProps) {
    const {divId, user} = props;
    const [session, setSession] = useSharedState<Session>(`session-${divId}`, undefined);

    useEffect(() => {
        if (session === undefined) {
            setSession({
                state: "pending",
                userId: user.userId
            })
        }

    }, [session, setSession]);
}
