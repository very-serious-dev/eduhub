import { useContext, useState } from "react";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import { accent, pointableSecondary, primary } from "../../../util/Themes";
import { useNavigate } from "react-router";
import QuestionnaireTextQuestion from "./QuestionnaireTextQuestion";
import QuestionnaireChoicesQuestion from "./QuestionnaireChoicesQuestion";
import AreYouSureDialog from "../dialogs/AreYouSureDialog";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import { beautifullyDisplayDateTime } from "../../../util/Formatter";

const QuestionnaireBodyStudentForm = (props) => {
    const [answers, setAnswers] = useState(new Array(props.questionnaireData.questions.length).fill(""));
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, ARE_YOU_SURE_EXIT, ARE_YOU_SURE_SUBMIT
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);
    const setFeedback = useContext(FeedbackContext);

    const onClose = () => {
        navigate(-1);
    }

    const onAnswerChanged = (questionIndex, newAnswer) => {
        setAnswers(old => old.map((a, idx) => idx === questionIndex ? newAnswer : a));
    }

    const onSubmit = (event) => {
        event.preventDefault();
        if (isLoading) { return; }
        setLoading(true);
        const body = {
            answers: answers.map((a, idx) => { return { number: idx + 1, answer: a, type: sortedQuestions()[idx].type } })
        }
        EduAPIFetch("POST", `/api/v1/questionnaires/${props.questionnaireData.id}/submits`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    setFeedback({ type: "success", message: "Entregado con éxito" });
                    navigate(-1);
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }

    const sortedQuestions = () => {
        const questions = [...props.questionnaireData.questions];
        questions.sort((a, b) => a.number - b.number);
        return questions;
    }

    return <>
        {popupShown === "ARE_YOU_SURE_EXIT" && <AreYouSureDialog onActionConfirmed={onClose}
            onDismiss={() => { setPopupShown("NONE"); }}
            dialogMode="DELETE"
            warningMessage="¿Deseas salir y perder tus respuestas?" />}
        {popupShown === "ARE_YOU_SURE_SUBMIT" && <AreYouSureDialog onActionConfirmed={onSubmit}
            onDismiss={() => { setPopupShown("NONE"); }}
            dialogMode="SUBMIT"
            warningMessage="¿Deseas subir tus respuestas? Tu entrega es definitiva y no se puede modificar" />}
        <div>
            <div className="classDetailHeaderTopIcons">
                <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { setPopupShown("ARE_YOU_SURE_EXIT") }}>✖️</div>
            </div>
            <div className="questionnairePageContainer">
                <div className="questionnaireDetailTitleHeader">
                    <div className="questionnaireDetailTitle">{props.questionnaireData.title}</div>
                    {props.questionnaireData.due_date && <div className="assignmentDetailDueDate">Se entrega: {beautifullyDisplayDateTime(props.questionnaireData.due_date)}</div>}
                    <div className={`classDetailSectionUnderline ${accent(theme)}`} />
                </div>
                {props.questionnaireData.mode === "secret_answers" && <div className="questionnaireModeHint">🔒 Respuesta oculta: No verás tus respuestas a medida que las tecleas. En las preguntas tipo <i>test</i>, escribe parcialmente la opción que desees en el recuadro de texto.</div>}
                <form onSubmit={(e) => { e.preventDefault(); setPopupShown("ARE_YOU_SURE_SUBMIT"); }}>
                    {sortedQuestions().map((question, qIdx) => {
                        if (question.type === "text") {
                            return <QuestionnaireTextQuestion question={question}
                                questionIndex={qIdx}
                                answer={answers[qIdx]}
                                isSecret={props.questionnaireData.mode === "secret_answers"}
                                setAnswer={onAnswerChanged} />
                        } else if (question.type === "choices") {
                            return <QuestionnaireChoicesQuestion question={question}
                                questionIndex={qIdx}
                                answer={answers[qIdx]}
                                isSecret={props.questionnaireData.mode === "secret_answers"}
                                setAnswer={onAnswerChanged} />
                        } else {
                            return <div>Tipo de pregunta no conocido</div>
                        }
                    })}
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                    <div className="formInputContainer questionnaireSubmitBottomMargin">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Entregar" />
                    </div>
                </form>
            </div>
        </div>
    </>
}

export default QuestionnaireBodyStudentForm;