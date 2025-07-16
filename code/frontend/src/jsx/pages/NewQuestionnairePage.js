import { useContext, useEffect, useRef, useState } from "react";
import NewQuestionnaire from "../components/questionnaires/NewQuestionnaire";
import LoadingHUD from "../components/common/LoadingHUD";
import { FeedbackContext } from "../main/GlobalContainer";
import { EduAPIFetch } from "../../client/APIFetch";
import { useSearchParams } from "react-router";

const NewQuestionnairePage = () => {
    const [isLoading, setLoading] = useState(false);
    /* TODO: Take care of this, apparently isn't giving any trouble
    src\jsx\pages\NewQuestionnairePage.js
    Line 17:19:  Assignments to the 'channel' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect  react-hooks/exhaustive-deps */
    const channel = useRef();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlFolderId = searchParams.get("fid");
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        document.title = "Nuevo formulario";
    }, []);

    useEffect(() => {
        channel.current = new BroadcastChannel("new_questionnaire");

        return () => { channel.current.close() }
    }, []);

    const onSubmitNewQuestionnaire = (title, questions) => {
        if (isLoading) { return; }
        setLoading(true);
        let url = "/api/v1/questionnaires";
        if (urlFolderId) {
            url += `?folderId=${urlFolderId}`;
        }
        EduAPIFetch("POST", url, { title: title, questions: questions })
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    channel.current.postMessage(json.result);
                    window.close();
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }

    return <div className="newQuestionnairePageContainer">
        <NewQuestionnaire onSubmitNewQuestionnaire={onSubmitNewQuestionnaire}
            submitText={urlFolderId ? "Guardar" : "Guardar y adjuntar"} />
        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
    </div>
}

export default NewQuestionnairePage;