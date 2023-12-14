import {Switch} from "@adobe/react-spectrum";
import {useMemo} from "react";
import {LivePresenceUser} from "@microsoft/live-share";

interface PresentationModeSwitchInterface {
    localUser: LivePresenceUser;
    presenterId: string;
    onChange: (value: boolean) => void;
}

export default function PresentationModeSwitch(props: PresentationModeSwitchInterface) {
    const {presenterId, localUser, onChange} = props;

    const isDisabled = useMemo(() => {
        return localUser.userId === presenterId;

    }, [presenterId, localUser])

    return (
        <Switch defaultSelected={true} onChange={onChange} isDisabled={isDisabled}>Presentation Mode</Switch>
    )
}
