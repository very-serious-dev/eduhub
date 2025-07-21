import { useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import Answer from "../questionnaires/Answer";

const QuestionnaireAnswersDialog = (props) => {
    const [answersData, setAnswersData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [requestErrorMessage, setRequestErrorMessage] = useState();

    useEffect(() => {
        setLoading(true);
        EduAPIFetch("GET", `/api/v1/questionnaires/${props.questionnaireId}/submits/${props.username}`)
            .then(json => {
                setLoading(false);
                setAnswersData(json);
            })
            .catch(error => {
                console.log("test")
                setLoading(false);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, []);

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground overflowScrollableDialog">
                <div className="dialogTitle">Respuestas</div>
                {answersData.questions?.toSorted((a, b) => a.number - b.number).map(question => {
                    const answer = answersData.answers.find(answer => answer.question_id === question.id);
                    return <Answer question={question} answer={answer} />
                })}
                {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                {requestErrorMessage && <div className="questionnaireAnswersDialogCenteredError">{`${requestErrorMessage} 😔`}</div>}
            </div>
        </div>
    </div>
}

export default QuestionnaireAnswersDialog;