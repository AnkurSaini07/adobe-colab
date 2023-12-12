import {useEffect, useState} from "react";
import {useLiveEvent, useSharedMap, useSharedState} from "@microsoft/live-share-react";
import {LivePresenceUser} from "@microsoft/live-share";

type Session = "pending" | "completed";

interface PdfViewerProps {
    divId: string;
    organizerId: any;
    localUser: LivePresenceUser;
}

const eventOptions = {
    // Pass the events to receive.
    // If no event is passed in listenOn, then all the annotation events will be received.
    listenOn: [
        "ANNOTATION_ADDED", "ANNOTATION_DELETED", "ANNOTATION_UPDATED"
    ]
}


export default function PdfViewer(props: PdfViewerProps) {
    const {divId, localUser, organizerId} = props;
    const {map, setEntry, deleteEntry} = useSharedMap(`annotation-map-${divId}`);
    const [session, setSession] = useSharedState<Session>(`session-${divId}`, "pending");
    const [viewer, setViewer] = useState<any>();
    const [synced, setSynced] = useState<boolean>(false);
    const {latestEvent, sendEvent} = useLiveEvent(`annot-change-${divId}`);

    useEffect(() => {
        //@ts-ignore
        const adobeDCView = new AdobeDC.View({clientId: "3e821bd37b2d405c8ebba6327a0998fa", divId});
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
        if (viewer && session === "pending" && localUser.userId === organizerId) {
            viewer.getAnnotationManager().then(async (am: any) => {
                const annotations = await am.getAnnotations();
                annotations.forEach((annot: any) => {
                    setEntry(annot.id, annot);
                });
            }).finally(() => {
                setSession("completed");
            });
        }
    }, [viewer, session, setSession, localUser, organizerId]);

    useEffect(() => {
        if (viewer && session === "completed") {
            // this is our local event
            viewer.getAnnotationManager().then(async (am: any) => {
                am.registerEventListener(async (event: any) => {
                    if (event.data.initiatorId || !synced) {
                        return;
                    }
                    const annot = {...event.data, initiatorId: localUser.userId};
                    if (event.type === "ANNOTATION_ADDED") {
                        setEntry(annot.id, annot); // no purpose of map
                        sendEvent({type: "ANNOTATION_ADDED", data: annot});
                        // await am.addAnnotations([annot]);
                    } else if (event.type === "ANNOTATION_UPDATED") {
                        setEntry(annot.id, annot);
                        sendEvent({type: "ANNOTATION_UPDATED", data: annot});
                        // await am.updateAnnotation(annot);
                    } else if (event.type === "ANNOTATION_DELETED") {
                        deleteEntry(annot.id);
                        sendEvent({type: "ANNOTATION_DELETED", data: annot});
                        // await am.deleteAnnotations({
                        //     annotationIds: [annot.id]
                        // });
                    }
                }, eventOptions);
            });
        }
    }, [session, viewer, synced, sendEvent, localUser]);

    useEffect(() => {
        if (viewer && session === "completed" && !synced) {
            if (localUser.userId === organizerId) {
                setSynced(true);
                return;
            }
            viewer.getAnnotationManager().then(async (am: any) => {
                await am.deleteAnnotations();
                await am.addAnnotations(Array.from(map.values()));
                setSynced(true);
            });
        }
    }, [map, session, viewer, synced, setSynced, localUser, organizerId]);

    useEffect(() => {
        if (viewer && synced) {
            console.log("=============>", latestEvent);
        }

    }, [latestEvent, viewer, synced]);

    return (
        <div style={{display: "flex", position: "relative", justifyContent: "center"}}>
            <div style={{height: "100vh", width: "100vw"}} id={divId}/>
            {
                session === "pending" &&
                <div style={{
                    top: "50px",
                    position: "absolute",
                    fontSize: "13px",
                    zIndex: 10,
                    borderRadius: "10px",
                    backgroundColor: "rgba(96, 94, 92, 0.9)",
                    color: "#fff",
                    padding: "7px 13px",
                }}>
                    {localUser.userId === organizerId ? "creating" : "joining"} commenting session...
                </div>
            }
        </div>
    );
}
