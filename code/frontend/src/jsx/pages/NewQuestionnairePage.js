import { useEffect } from "react";
import NewQuestionnaire from "../components/questionnaires/NewQuestionnaire";

const NewQuestionnairePage = () => {
    let channel;

    useEffect(() => {
        document.title = "Nuevo formulario";
    }, []);

    useEffect(() => {
        channel = new BroadcastChannel("new_questionnaire");

        return () => { channel.close() }
    }, []);

    const onFinish = () => {
        channel?.postMessage("FINISH");
        window.close();
    }

    return <div className="newQuestionnairePageContainer">
        <NewQuestionnaire />
        <button onClick={onFinish}>Volver</button>
    </div>
}

export default NewQuestionnairePage;