import {useEffect, useState} from "react";
import {useSharedMap, useSharedState} from "@microsoft/live-share-react";

type Session = { state: "pending" | "completed", userId: any };

interface PdfViewerProps {
    id: string;
    userId: any;
}

const eventOptions = {
    // Pass the events to receive.
    // If no event is passed in listenOn, then all the annotation events will be received.
    listenOn: [
        "ANNOTATION_ADDED", "ANNOTATION_DELETED", "ANNOTATION_UPDATED"
    ]
}


export default function PdfViewer(props: PdfViewerProps) {
    const divId = props.id;
    const {map, setEntry, deleteEntry} = useSharedMap(`annotation-map-${divId}`);
    const [session, setSession] = useSharedState<Session>(`session-${divId}`, {
        state: "pending",
        userId: props.userId
    });
    const [viewer, setViewer] = useState<any>();

    useEffect(() => {
        //@ts-ignore
        const adobeDCView = new AdobeDC.View({clientId: "beaeb4419632408088413d8a98396c63", divId});
        adobeDCView.previewFile({
            content: {location: {url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf"}},
            metaData: {fileName: "Bodea Brochure.pdf", id: "77c6fa5d-6d74-4104-8349-657c8411a834"}
        }, {
            showAnnotationTools: true,
            enableAnnotationAPIs: true,
        }).then((viewer: any) => {
            setViewer(viewer);
        });
    }, [setViewer]);

    useEffect(() => {
        if (viewer && session.state === "pending" && session.userId === props.userId) {
            viewer.getAnnotationManager().then(async (am: any) => {
                if (session === undefined) {
                    const annotations = await am.getAnnotations();
                    annotations.forEach((annot: any) => {
                        setEntry(annot.id, annot);
                    });
                    setSession({
                        state: "completed",
                        userId: props.userId
                    });
                }
            });
        }
    }, [viewer, session, setSession]);

    useEffect(() => {
        if (viewer && session.state === "completed") {
            viewer.getAnnotationManager().then(async (am: any) => {
                am.registerEventListener((event: any) => {
                    if (event.type === "ANNOTATION_ADDED" || event.type === "ANNOTATION_UPDATED") {
                        setEntry(event.data.id, event.data);
                    } else if (event.type === "ANNOTATION_DELETED") {
                        deleteEntry(event.data.id);
                    }
                }, eventOptions);
            });
        }
    }, [session, viewer]);

    useEffect(() => {
        /*then(async (viewer: any) => {

        }).then((am: any) => {

        });*/
    }, [map]);

    return <div style={{height: "100vh", width: "100vw"}} id={divId}/>
}
