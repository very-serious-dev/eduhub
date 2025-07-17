import { useContext, useEffect, useRef, useState } from "react";
import NewQuestionnaire from "../components/questionnaires/NewQuestionnaire";
import LoadingHUD from "../components/common/LoadingHUD";
import { FeedbackContext } from "../main/GlobalContainer";
import { EduAPIFetch } from "../../client/APIFetch";
import { useSearchParams } from "react-router";

const NewQuestionnairePage = () => {
    const [isLoading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const channel = useRef();
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        document.title = "Nuevo formulario";
    }, []);

    useEffect(() => {
        channel.current = new BroadcastChannel("new_questionnaire");

        return () => { channel.current.close() }
    }, []);

    const onBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
    };

    useEffect(() => {
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, []);

    const onSubmitNewQuestionnaire = (title, questions) => {
        if (questions.length === 0) { alert("Debes añadir al menos 1 pregunta"); return; }
        if (isLoading) { return; }
        setLoading(true);
        let url = "/api/v1/questionnaires";
        if (searchParams.get("cid")) {
            url += `?classroomId=${searchParams.get("cid")}`;
        } else if (searchParams.get("fid")) {
            url += `?folderId=${searchParams.get("fid")}`;
        }
        EduAPIFetch("POST", url, { title: title, questions: questions })
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    channel.current.postMessage(json.result);
                    window.removeEventListener('beforeunload', onBeforeUnload);
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

    return <div className="questionnairePageContainer">
        <NewQuestionnaire onSubmitNewQuestionnaire={onSubmitNewQuestionnaire}
            submitText={searchParams.get("cid") ? "Guardar y adjuntar" : "Guardar"} />
        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
    </div>
}

export default NewQuestionnairePage;