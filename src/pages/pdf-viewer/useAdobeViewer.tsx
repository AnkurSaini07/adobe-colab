import {useEffect, useState} from "react";
import {LivePresenceUser} from "@microsoft/live-share";

interface UserAdobeViewerProps {
    divId: string;
    localUser: LivePresenceUser;
}

export default function useAdobeViewer(props: UserAdobeViewerProps) {
    const [viewer, setViewer] = useState<any>();
    const [annotationManager, setAnnotationManager] = useState<any>();
    const {divId, localUser} = props;

    useEffect(() => {
        if (!viewer) {
            //@ts-ignore
            const adobeDCView = new AdobeDC.View({clientId: "3e821bd37b2d405c8ebba6327a0998fa", divId});
            //@ts-ignore
            adobeDCView.registerCallback(AdobeDC.View.Enum.CallbackType.GET_USER_PROFILE_API, function () {
                return new Promise((resolve, reject) => {
                    resolve({
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
                    });
                });
            }, {});
            adobeDCView.previewFile({
                content: {location: {url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf"}},
                metaData: {fileName: "Bodea Brochure.pdf", id: "77c6fa5d-6d74-4104-8349-657c8411a834"}
            }, {
                showAnnotationTools: true,
                enableAnnotationAPIs: true,
            }).then(async (viewer: any) => {
                setViewer(viewer);
                setAnnotationManager(await viewer.getAnnotationManager());
            });
        }
    }, [viewer, setViewer, setAnnotationManager, localUser]);

    return {viewer, annotationManager};
}
