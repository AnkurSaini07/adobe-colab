import {useCallback, useEffect, useState} from "react";
import {useLiveEvent, useSharedMap, useSharedState} from "@microsoft/live-share-react";
import {LivePresenceUser} from "@microsoft/live-share";
import useAdobeViewer from "./useAdobeViewer";
import TeamsHelper from "../../helpers/TemsHelper";
import PdfControls from "./PdfControls";

type Session = "pending" | "completed";

interface PdfViewerProps {
    divId: string;
    organizerId: any;
    localUser: LivePresenceUser;
    allUsers: Array<LivePresenceUser>;
}

const eventOptions = {
    listenOn: [
        "ANNOTATION_ADDED", "ANNOTATION_DELETED", "ANNOTATION_UPDATED"
    ]
}


export default function PdfViewer(props: PdfViewerProps) {
    const {divId, localUser, organizerId, allUsers} = props;

    const {map, setEntry, deleteEntry} = useSharedMap(`annotation-map-${divId}`);
    const [session, setSession] = useSharedState<Session>(`session-${divId}`, "pending");
    const {latestEvent, sendEvent} = useLiveEvent(`annot-change-${divId}`);
    const [presenterId, setPresenterId] = useSharedState<string>(`presenter-state-${divId}`, organizerId);
    const [eventProcessed] = useState<Set<String>>(new Set());
    const [synced, setSynced] = useState<boolean>(false);
    const [isViewerDisabled, setViewerDisabled] = useState<boolean>(true);

    const {viewer, annotationManager} = useAdobeViewer({divId, localUser, presenterId, isViewerDisabled});

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
            const annot = latestEvent.value.data;
            eventProcessed.add(annot.id);
            if (latestEvent.value.type === "ANNOTATION_ADDED") {
                annotationManager.addAnnotations([annot], {silent: true});
            } else if (latestEvent.value.type === "ANNOTATION_UPDATED") {
                annotationManager.updateAnnotation(annot, {silent: true});
            } else if (latestEvent.value.type === "ANNOTATION_DELETED") {
                annotationManager.deleteAnnotations({
                    annotationIds: [annot.id]
                });
            }
        }

    }, [session, latestEvent, annotationManager, eventProcessed]);


    const handleViewerChange = useCallback((options: any) => {
        setViewerDisabled(options.isDisabled);
    }, [setViewerDisabled]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            justifyContent: "center",
            height: "100vh",
            width: "100vw"
        }}>
            <div style={{flex: 1, position: "relative"}}>
                {isViewerDisabled && <div style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    zIndex: 10,
                    backgroundColor: "transparent"
                }}/>}
                <div style={{flex: 1}} id={divId}/>
            </div>
            <PdfControls
                presenterId={presenterId}
                setPresenterId={setPresenterId}
                handleViewerChange={handleViewerChange}
                divId={divId}
                localUser={localUser}
                allUsers={allUsers}
                organizerId={organizerId}/>
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
