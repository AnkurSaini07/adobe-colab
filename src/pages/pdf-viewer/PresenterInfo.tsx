import {Text} from "@adobe/react-spectrum";
import {LivePresenceUser} from "@microsoft/live-share";
import {useMemo} from "react";

interface PresenterInfoProps {
    presenterId: string;
    localUser: LivePresenceUser;
    allUsers: Array<LivePresenceUser>;

}

export default function PresenterInfo(props: PresenterInfoProps) {
    const {localUser, presenterId, allUsers} = props;
    const presenter = useMemo(() => {
        if (localUser.userId === presenterId) {
            return localUser;
        }
        return allUsers.find(user => user.userId === presenterId);

    }, [localUser, presenterId, allUsers]);

    return (
        <Text width="250px" UNSAFE_style={{textAlign: "center"}}>
            {localUser.userId === presenterId && "You are controlling this presentation."}
            {localUser.userId !== presenterId && presenter && `${presenter.displayName} is controlling this presentation.`}
        </Text>
    )
}
