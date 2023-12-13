import {Switch} from "@adobe/react-spectrum";
import {useMemo} from "react";
import {LivePresenceUser} from "@microsoft/live-share";

interface EditModeSwitchInterface {
    localUser: LivePresenceUser;
    presenterId: string;
    onChange: (value: boolean) => void;
}

export default function EditModeSwitch(props: EditModeSwitchInterface) {
    const {presenterId, localUser, onChange} = props;

    const isDisabled = useMemo(() => {
        return localUser.userId === presenterId;

    }, [presenterId, localUser])

    return (
        <Switch onChange={onChange} isDisabled={isDisabled}>Edit Mode</Switch>
    )
}
