import {View} from "@adobe/react-spectrum";
import {LivePresenceUser} from "@microsoft/live-share";
import {useEffect, useMemo, useState} from "react";
import TeamsHelper from "../../helpers/TemsHelper";
import UserDropdown from "./UserDropdown";
import PresenterInfo from "./PresenterInfo";
import ControlButton from "./ControlButton";
import EditModeSwitch from "./EditModeSwitch";

interface PdfControlsProps {
    localUser: LivePresenceUser;
    allUsers: Array<LivePresenceUser>;
    organizerId: string;
    presenterId: string;
    divId: string;
    handleViewerChange: (options: any) => void;
    setPresenterId: (presenterId: string) => void;
}

export default function PdfControls(props: PdfControlsProps) {
    const {localUser, organizerId, allUsers, divId, presenterId, handleViewerChange, setPresenterId} = props;
    const [editMode, setEditMode] = useState<boolean>(false);

    const disabledKeys = useMemo(() => {
        const keys: Set<string> = new Set<string>();
        keys.add(organizerId);
        if (!TeamsHelper.isLocalUserOrganizer(organizerId, localUser.userId)) {
            allUsers.forEach(user => {
                keys.add(user.userId);
            });
        }
        return keys;
    }, [localUser, organizerId]);


    useEffect(() => {
        let isDisabled = false;
        if (localUser.userId !== presenterId && !editMode) {
            isDisabled = true;
        }
        handleViewerChange({isDisabled});
    }, [localUser, presenterId, handleViewerChange, editMode]);


    return (
        <View UNSAFE_style={{
            display: "flex",
            padding: "10px",
            alignItems: "center",
            gap: "10px"
        }}
              backgroundColor="gray-50" height="60px" zIndex={10} borderColor="gray-200" borderWidth="thin">

            <UserDropdown allUsers={allUsers} disabledKeys={disabledKeys} setPresenterId={setPresenterId}/>
            <ControlButton localUser={localUser} organizerId={organizerId} presenterId={presenterId}
                           setPresenterId={setPresenterId}/>
            <EditModeSwitch onChange={setEditMode} presenterId={presenterId} localUser={localUser}/>
            <View flex={1}/>
            <PresenterInfo presenterId={presenterId} allUsers={allUsers} localUser={localUser}/>
        </View>
    )
}
