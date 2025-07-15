import { useContext, useEffect, useState } from "react";
import NewQuestionnaire from "../components/questionnaires/NewQuestionnaire";
import LoadingHUD from "../components/common/LoadingHUD";
import { FeedbackContext } from "../main/GlobalContainer";
import { EduAPIFetch } from "../../client/APIFetch";

const NewQuestionnairePage = () => {
    const [isLoading, setLoading] = useState(false);
    let channel;
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        document.title = "Nuevo formulario";
    }, []);

    useEffect(() => {
        channel = new BroadcastChannel("new_questionnaire");

        return () => { channel.close() }
    }, []);

    const onSubmitNewQuestionnaire = (title, questions) => {
        if (isLoading) { return; }
        setLoading(true);

        EduAPIFetch("POST", "/api/v1/questionnaires", { title: title, questions: questions })
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    channel.postMessage(json.result);
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
        <NewQuestionnaire onSubmitNewQuestionnaire={onSubmitNewQuestionnaire} />
        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
    </div>
}

export default NewQuestionnairePage;