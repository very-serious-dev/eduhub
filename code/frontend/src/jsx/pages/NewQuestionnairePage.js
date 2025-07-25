import { useContext, useEffect, useRef, useState } from "react";
import NewQuestionnaire from "../components/questionnaires/NewQuestionnaire";
import LoadingHUD from "../components/common/LoadingHUD";
import { FeedbackContext } from "../main/GlobalContainer";
import { EduAPIFetch } from "../../client/APIFetch";
import { useSearchParams } from "react-router";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";

const NewQuestionnairePage = () => {
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestError, setRequestError] = useState();
    const [questionnaireBeingEdited, setQuestionnaireBeingEdited] = useState();
    // eslint-disable-next-line no-unused-vars
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

    useEffect(() => {
        if (searchParams.get("qid")) {
            setLoading(true);
            EduAPIFetch("GET", `/api/v1/questionnaires/${searchParams.get("qid")}/questions`)
                .then(json => {
                    setLoading(false);
                    setQuestionnaireBeingEdited(json);
                })
                .catch(error => {
                    setLoading(false);
                    //setRequestFailed(true);
                    //setRequestError(error);
                })
        }
    }, [])

    const onSubmitNewQuestionnaire = (title, questions) => {
        if (isLoadingSubmit) { return; }
        setLoadingSubmit(true);
        let method = "POST";
        let url = "/api/v1/questionnaires";
        if (searchParams.get("cid")) { // Being added from a classroom's Create/Edit Post dialog
            url += `?classroomId=${searchParams.get("cid")}`;
        } else if (searchParams.get("fid")) { // Being added from files browser New Questionnaire
            url += `?folderId=${searchParams.get("fid")}`;
        } else if (questionnaireBeingEdited) { // Being edited from files browser
            url += `/${questionnaireBeingEdited.id}/questions`
            method = "PUT";
        }
        EduAPIFetch(method, url, { title: title, questions: questions })
            .then(json => {
                setLoadingSubmit(false);
                if (json.success === true) {
                    channel.current.postMessage(json.result);
                    window.removeEventListener('beforeunload', onBeforeUnload);
                    window.close();
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
            })
            .catch(error => {
                setLoadingSubmit(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestError?.error ?? "Se ha producido un error"} showGoBack={requestError?.client_behaviour === "suggest_go_back"} />
            : <div className="questionnairePageContainer">
                <NewQuestionnaire onSubmitNewQuestionnaire={onSubmitNewQuestionnaire}
                    questionnaireBeingEdited={questionnaireBeingEdited}
                    submitText={searchParams.get("cid") ? "Guardar y adjuntar" : "Guardar"} />
                {isLoadingSubmit && <div className="loadingHUDCentered"><LoadingHUD /></div>}
            </div>
}

export default NewQuestionnairePage;