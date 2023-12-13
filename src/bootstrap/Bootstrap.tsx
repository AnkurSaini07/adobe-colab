import useAppReady from "../hooks/useAppReady";
import App from "./App";
import {defaultTheme, Provider} from "@adobe/react-spectrum";


export default function Bootstrap() {
    const appReady = useAppReady();

    if (!appReady) {
        return null;
    }

    return (
        <Provider theme={defaultTheme}>
            <App/>
        </Provider>
    )
}
