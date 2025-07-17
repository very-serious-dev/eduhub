import { useContext, useEffect, useState } from "react";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import { accent, pointableSecondary, primary } from "../../../util/Themes";
import { useNavigate } from "react-router";
import TextQuestion from "./TextQuestion";
import ChoicesQuestion from "./ChoicesQuestion";
import AreYouSureDialog from "../dialogs/AreYouSureDialog";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";

const QuestionnaireBodyStudentForm = (props) => {
    const [answers, setAnswers] = useState(new Array(props.questionnaireData.questions.length).fill(""));
    const [areYouSureExit, setAreYouSureExit] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);
    const setFeedback = useContext(FeedbackContext);

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
                    window.removeEventListener('beforeunload', onBeforeUnload);
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
        {areYouSureExit && <AreYouSureDialog onActionConfirmed={onClose}
            onDismiss={() => { setAreYouSureExit(false); }}
            dialogMode="DELETE"
            warningMessage="¿Deseas salir y perder tus respuestas?" />}
        <div>
            <div className="classDetailHeaderTopIcons">
                <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { setAreYouSureExit(true) }}>✖️</div>
            </div>
            <div className="questionnairePageContainer">
                <div className="questionnaireDetailTitleHeader">
                    <div className="questionnaireDetailTitle">{props.questionnaireData.title}</div>
                    <div className={`classDetailSectionUnderline ${accent(theme)}`} />
                </div>
                <form onSubmit={onSubmit}>
                    {sortedQuestions().map((question, qIdx) => {
                        if (question.type === "text") {
                            return <TextQuestion question={question}
                                questionIndex={qIdx}
                                answer={answers[qIdx]}
                                setAnswer={onAnswerChanged} />
                        }
                        if (question.type === "choices") {
                            return <ChoicesQuestion question={question}
                                questionIndex={qIdx}
                                answer={answers[qIdx]}
                                setAnswer={onAnswerChanged} />
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