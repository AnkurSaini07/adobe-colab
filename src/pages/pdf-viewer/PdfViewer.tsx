import {useEffect, useState} from "react";
import {useLiveEvent, useSharedMap, useSharedState} from "@microsoft/live-share-react";
import {LivePresenceUser} from "@microsoft/live-share";
import useAdobeViewer from "./useAdobeViewer";
import TeamsHelper from "../../helpers/TemsHelper";

type Session = "pending" | "completed";

interface PdfViewerProps {
    divId: string;
    organizerId: any;
    localUser: LivePresenceUser;
}

const eventOptions = {
    listenOn: [
        "ANNOTATION_ADDED", "ANNOTATION_DELETED", "ANNOTATION_UPDATED"
    ]
}


export default function PdfViewer(props: PdfViewerProps) {
    const {divId, localUser, organizerId} = props;
    const {viewer, annotationManager} = useAdobeViewer({divId, localUser});

    const {map, setEntry, deleteEntry} = useSharedMap(`annotation-map-${divId}`);
    const [session, setSession] = useSharedState<Session>(`session-${divId}`, "pending");
    const {latestEvent, sendEvent} = useLiveEvent(`annot-change-${divId}`);
    const [eventProcessed] = useState<Set<String>>(new Set());
    const [synced, setSynced] = useState<boolean>(false);

    // create session
    useEffect(() => {
        if (annotationManager && TeamsHelper.isLocalUserOrganizer(organizerId, localUser.userId) && session === "pending") {
            annotationManager.getAnnotations().then((annotations: any) => {
                annotations?.forEach((annot: any) => {
                    setEntry(annot.id, annot);
                });
            }).finally(() => {
                setSession("completed");
            });
        }

    }, [localUser, organizerId, annotationManager, session, setSession]);

    // register events
    useEffect(() => {
        if (annotationManager && session === "completed" && synced) {
            annotationManager.registerEventListener((event: any) => {
                console.log("===========local event=======>", event);
                const annot = event.data;
                if (eventProcessed.has(annot.id)) {
                    eventProcessed.delete(annot.id);
                    return;
                }
                if (["ANNOTATION_ADDED", "ANNOTATION_UPDATED"].includes(event.type)) {
                    setEntry(annot.id, event.data);
                } else if (event.type === "ANNOTATION_DELETED") {
                    deleteEntry(annot.id);
                }
                sendEvent(event).catch(console.error);
            }, eventOptions);
        }
    }, [annotationManager, session, sendEvent, localUser, setEntry, deleteEntry, eventProcessed, synced]);

    // for syncing
    useEffect(() => {
        if (annotationManager && !synced && session === "completed") {
            annotationManager.deleteAnnotations({}).finally(async () => {
                const annots = Array.from(map.values());
                if (annots.length) {
                    await annotationManager.addAnnotations(annots);
                }
                setSynced(true);
            });
        }
    }, [localUser, organizerId, annotationManager, session, synced, setSynced]);


    // listen for global events
    useEffect(() => {
        if (annotationManager && session === "completed" && latestEvent && !latestEvent.local) {
            console.log("Global events ========>", latestEvent);
            const annot = latestEvent.value.data;
            eventProcessed.add(annot.id);
            if (latestEvent.value.type === "ANNOTATION_ADDED") {
                annotationManager.addAnnotations([annot]);
            } else if (latestEvent.value.type === "ANNOTATION_UPDATED") {
                annotationManager.updateAnnotation(annot);
            } else if (latestEvent.value.type === "ANNOTATION_DELETED") {
                annotationManager.deleteAnnotations({
                    annotationIds: [annot.id]
                });
            }
        }

    }, [session, latestEvent, annotationManager, eventProcessed]);

    return (
        <div style={{display: "flex", position: "relative", justifyContent: "center"}}>
            <div style={{height: "100vh", width: "100vw"}} id={divId}/>
            {
                viewer && session === "pending" &&
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
                    {TeamsHelper.isLocalUserOrganizer(organizerId, localUser.userId)
                        ? "creating" : "joining"} commenting session...
                </div>
            }
        </div>
    );
}
