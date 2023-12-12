import {PropsWithChildren} from "react";

export default function Splash(props: PropsWithChildren<any>) {
    return (
        <div style={{height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <span>{props.children}</span>
        </div>
    );
}
