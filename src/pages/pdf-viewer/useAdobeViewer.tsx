import {useEffect, useState} from "react";
import {LivePresenceUser} from "@microsoft/live-share";
import {useSharedState} from "@microsoft/live-share-react";

interface UserAdobeViewerProps {
    divId: string;
    localUser: LivePresenceUser;
    presenterId: string;
    isViewerDisabled: boolean;
}

export default function useAdobeViewer(props: UserAdobeViewerProps) {
    const {divId, localUser, presenterId, isViewerDisabled} = props;
    const [viewer, setViewer] = useState<any>();
    const [annotationManager, setAnnotationManager] = useState<any>();
    const [viewerState, setViewerState] = useSharedState(`pdf-viewer-state-${divId}`, {
        currentPage: undefined,
        zoomLevel: undefined
    });

    useEffect(() => {
        if (!viewer) {
            //@ts-ignore
            const adobeDCView = new AdobeDC.View({clientId: "3e821bd37b2d405c8ebba6327a0998fa", divId});
            //@ts-ignore
            adobeDCView.registerCallback(AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API, async function () {
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
            adobeDCView.previewFile({
                content: {location: {url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf"}},
                metaData: {fileName: "Bodea Brochure.pdf", id: "77c6fa5d-6d74-4104-8349-657c8411a834"}
            }, {
                showAnnotationTools: true,
                enableAnnotationAPIs: true,
                enableInternalEvents: true,
                enableFilePreviewEvents: true,
            }).then(async (_viewer: any) => {
                setViewer(_viewer);
                setAnnotationManager(await _viewer.getAnnotationManager());

                // @ts-ignore
                window.viewer = _viewer;
            });
        }
    }, []);

    useEffect(() => {
        let intervalId: any;
        if (viewer && presenterId === localUser.userId) {
            intervalId = setInterval(async () => {
                const apis = await viewer.getAPIs();
                const currentPage = await apis.getCurrentPage();
                const zoomLevel = await apis.getPageZoom(currentPage);
                setViewerState({currentPage, zoomLevel});
            }, 1000);

        }

        return () => {
            if (intervalId) {
                return clearInterval(intervalId);
            }
        }

    }, [viewer, presenterId, localUser, setViewerState]);


    // isViewerDisabled means its in presentation mode
    useEffect(() => {
        if (viewer && isViewerDisabled && presenterId !== localUser.userId) {
            viewer.getAPIs().then(async (apis: any) => {
                if (Number.isInteger(viewerState.currentPage)) {
                    apis.gotoLocation(viewerState.currentPage);
                    apis.getZoomAPIs().setZoomLevel(viewerState.zoomLevel);
                }
            });
        }

    }, [viewer, presenterId, localUser, isViewerDisabled, viewerState]);

    return {viewer, annotationManager};
}
