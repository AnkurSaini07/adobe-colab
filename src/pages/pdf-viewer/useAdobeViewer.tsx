import {useEffect, useState} from "react";
import {LivePresenceUser} from "@microsoft/live-share";
import {useSharedState} from "@microsoft/live-share-react";

interface UserAdobeViewerProps {
    divId: string;
    localUser: LivePresenceUser;
    presenterId: string;
    isViewerDisabled: boolean;
}

const xy: any = [];
let pageNumber = 0;

export default function useAdobeViewer(props: UserAdobeViewerProps) {
    const {divId, localUser, presenterId, isViewerDisabled} = props;
    const [viewer, setViewer] = useState<any>();
    const [adobeDCView, setAdobeDCView] = useState<any>();
    const [annotationManager, setAnnotationManager] = useState<any>();
    const [viewerState, setViewerState] = useSharedState(`pdf-viewer-state-${divId}`, {
        pageNumber: undefined,
        zoomLevel: undefined,
        x: undefined,
        y: undefined,
    });


    useEffect(() => {
        if (!viewer) {
            //@ts-ignore
            const _adobeDCView = new AdobeDC.View({clientId: "3e821bd37b2d405c8ebba6327a0998fa", divId});
            setAdobeDCView(_adobeDCView);
            //@ts-ignore
            _adobeDCView.registerCallback(AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API, async function () {
                return {
                    // @ts-ignore
                    code: AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
                    data: {
                        userProfile: {
                            name: localUser.displayName,
                            firstName: localUser.displayName?.split(" ")[0],
                            lastName: localUser.displayName?.split(" ")[1] || "",
                            email: localUser.userId
                        }
                    }
                };
            }, {});
            _adobeDCView.previewFile({
                content: {location: {url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf"}},
                metaData: {fileName: "Bodea Brochure.pdf", id: "77c6fa5d-6d74-4104-8349-657c8411a834"}
            }, {
                showAnnotationTools: true,
                enableAnnotationAPIs: true
            }).then(async (_viewer: any) => {
                setViewer(_viewer);
                setAnnotationManager(await _viewer.getAnnotationManager());
            });

        }
    }, []);

    useEffect(() => {
        if (adobeDCView && viewer) {
            // @ts-ignore
            adobeDCView.registerCallback(AdobeDC.View.Enum.CallbackType.EVENT_LISTENER, async function (event) {
                if (presenterId === localUser.userId) {
                    if (event.type === "DOCUMENT_VIEW_STATE_UPDATE") {
                        xy[0] = event.data.x;
                        xy[1] = event.data.y;
                        pageNumber = event.data.pageNumber;
                        const apis = await viewer.getAPIs();
                        const zoomLevel = await apis.getPageZoom(pageNumber);
                        //@ts-ignore
                        setViewerState({pageNumber, zoomLevel, x: xy[0], y: xy[1]});

                    }
                }
            }, {
                enableInternalEvents: true,
                enableFilePreviewEvents: true,
            });
        }
    }, [adobeDCView, presenterId, localUser, setViewerState, viewer]);


    // isViewerDisabled means its in presentation mode
    useEffect(() => {
        if (viewer && isViewerDisabled && presenterId !== localUser.userId) {
            viewer.getAPIs().then(async (apis: any) => {
                if (Number.isInteger(viewerState.pageNumber)) {
                    //@ts-ignore
                    apis.gotoLocation(viewerState.pageNumber, viewerState.x, viewerState.y);
                    apis.getZoomAPIs().setZoomLevel(viewerState.zoomLevel);
                }
            });
        }

    }, [viewer, presenterId, localUser, isViewerDisabled, viewerState]);

    return {viewer, annotationManager};
}
