import {ActionButton, Item, Menu, MenuTrigger} from "@adobe/react-spectrum";
import {LivePresenceUser} from "@microsoft/live-share";

interface UserDropDownProps {
    allUsers: Array<LivePresenceUser>;
    disabledKeys: Set<string>;
    setPresenterId: (presenterId: string) => void;
}

export default function UserDropdown(props: UserDropDownProps) {
    const {allUsers, disabledKeys, setPresenterId} = props;
    return (
        <MenuTrigger>
            <ActionButton>
                {allUsers.length} active {allUsers.length === 1 ? "user" : "users"}
            </ActionButton>
            <Menu items={allUsers} disabledKeys={disabledKeys}
                  onAction={(key) => setPresenterId(key.toString())}>
                {item => <Item key={item.userId}>{item.displayName}</Item>}
            </Menu>
        </MenuTrigger>
    )
}
