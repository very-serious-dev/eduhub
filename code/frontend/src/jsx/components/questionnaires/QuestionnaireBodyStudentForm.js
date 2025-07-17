import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, pointableSecondary, primary } from "../../../util/Themes";
import { useNavigate } from "react-router";
import TextQuestion from "./TextQuestion";
import ChoicesQuestion from "./ChoicesQuestion";
import AreYouSureDialog from "../dialogs/AreYouSureDialog";

const QuestionnaireBodyStudentForm = (props) => {
    const [answers, setAnswers] = useState(new Array(props.questionnaireData.questions.length).fill(""));
    const [areYouSureExit, setAreYouSureExit] = useState(false);
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    useEffect(() => {
        const onBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
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

    const questions = [...props.questionnaireData.questions];
    questions.sort((a, b) => a.number - b.number);

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
                <form>
                    {questions.map((question, qIdx) => {
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
                    <div className="formInputContainer questionnaireSubmitBottomMargin">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Entregar" />
                    </div>
                </form>
            </div>
        </div>
    </>
}

export default QuestionnaireBodyStudentForm;