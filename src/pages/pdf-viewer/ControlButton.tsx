import {ActionButton} from "@adobe/react-spectrum";
import {LivePresenceUser} from "@microsoft/live-share";
import TeamsHelper from "../../helpers/TemsHelper";
import {useMemo} from "react";

interface ControlButtonProps {
    organizerId: string;
    presenterId: string;
    localUser: LivePresenceUser;
    setPresenterId: (presenterId: string) => void;
}

export default function ControlButton(props: ControlButtonProps) {
    const {organizerId, localUser, presenterId, setPresenterId} = props;

    const isDisabled = useMemo(() => {
        let isDisabled = false;
        const isLocalUserOrganizer = TeamsHelper.isLocalUserOrganizer(organizerId, localUser.userId);
        if (isLocalUserOrganizer) {
            if (localUser.userId === presenterId) {
                isDisabled = true;
            }
        } else {
            if (localUser.userId !== presenterId) {
                isDisabled = true;
            }
        }
        return isDisabled;
    }, [organizerId, localUser, presenterId])

    return (
        <ActionButton isDisabled={isDisabled} onPress={() => setPresenterId(organizerId)}>
            {TeamsHelper.isLocalUserOrganizer(organizerId, localUser.userId) ? "Take Presentation Control" : "Leave Presentation Control"}
        </ActionButton>
    )

}
