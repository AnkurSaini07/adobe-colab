import useAppReady from "../hooks/useAppReady";
import App from "./App";

export default function Bootstrap() {
    const appReady = useAppReady();

    if (!appReady) {
        return null;
    }

    return <App/>
}
