import { useContext, useState } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, accentFormLabel, pointablePrimary, pointableSecondary, primary, secondary } from "../../../util/Themes";
import NewQuestionnaireChoicesQuestion from "./NewQuestionnaireChoicesQuestion";
import NewQuestionnaireTextQuestion from "./NewQuestionnaireTextQuestion";
import ConfigureQuestionnaireScoreDialog from "../dialogs/ConfigureQuestionnaireScoreDialog";

const NewQuestionnaire = (props) => {
    const [formTitle, setFormTitle] = useState(props.questionnaireBeingEdited ? props.questionnaireBeingEdited.title : "");
    const [formQuestions, setFormQuestions] = useState(props.questionnaireBeingEdited ? [...props.questionnaireBeingEdited.questions] : []);
    const [showConfigureScores, setShowConfigureScores] = useState(false);
    const theme = useContext(ThemeContext);

    const onAddChoicesQuestion = () => {
        setFormQuestions(old => old.concat({
            type: "choices",
            title: "",
            choices: [],
            correct_answer_score: 1,
            incorrect_answer_score: 0
        }))
    }

    const onAddTextQuestion = () => {
        setFormQuestions(old => old.concat({
            type: "text",
            title: ""
        }))
    }

    const setQuestionTitle = (questionIndex, newTitle) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return { ...q, title: newTitle }
            }
            return q;
        }))
    }

    const onDeleteQuestion = (questionIndex) => {
        setFormQuestions(old => old.filter((q, idx) => idx !== questionIndex))
    }

    const onMoveQuestionUp = (questionIndex) => {
        setFormQuestions(old => {
            const newQuestions = [...old];
            const temp = newQuestions[questionIndex - 1]
            newQuestions[questionIndex - 1] = newQuestions[questionIndex];
            newQuestions[questionIndex] = temp;
            return newQuestions;
        })
    }

    const onMoveQuestionDown = (questionIndex) => {
        setFormQuestions(old => {
            const newQuestions = [...old];
            const temp = newQuestions[questionIndex + 1]
            newQuestions[questionIndex + 1] = newQuestions[questionIndex];
            newQuestions[questionIndex] = temp;
            return newQuestions;
        })
    }

    const onAddChoice = (questionIndex) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return { ...q, choices: q.choices.concat({ content: "", is_correct: false }) }
            }
            return q;
        }))
    }

    const onDeleteChoice = (questionIndex, choiceIndex) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return { ...q, choices: q.choices.filter((c, cIdx) => cIdx !== choiceIndex) }
            }
            return q;
        }))
    }

    const setChoiceContent = (questionIndex, choiceIndex, newContent) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return {
                    ...q, choices: q.choices.map((c, cIdx) => {
                        if (cIdx === choiceIndex) {
                            return { ...c, content: newContent };
                        }
                        return c;
                    })
                }
            }
            return q;
        }))
    }

    const onMarkUnmarkCorrectChoice = (questionIndex, choiceIndex) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return {
                    ...q, choices: q.choices.map((c, cIdx) => {
                        if (cIdx === choiceIndex) {
                            return { ...c, is_correct: !c.is_correct };
                        }
                        return { ...c, is_correct: false };
                    })
                }
            }
            return q;
        }))
    }

    const onChangeCorrectAnswerScore = (questionIndex, newValue) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return { ...q, correct_answer_score: newValue }
            }
            return q;
        }))
    }

    const onChangeIncorrectAnswerScore = (questionIndex, newValue) => {
        setFormQuestions(old => old.map((q, idx) => {
            if (idx === questionIndex) {
                return { ...q, incorrect_answer_score: newValue }
            }
            return q;
        }))
    }

    const onConfigureScoresClicked = () => {
        setShowConfigureScores(true);
    }

    const onScoreConfigured = (scorePerCorrectAnswer, penaltyPerIncorrectAnswer) => {
        setFormQuestions(old => old.map(q => {
            if (q.type === "choices") {
                if (q.choices.some(choice => choice.is_correct)) {
                    return {
                        ...q,
                        correct_answer_score: scorePerCorrectAnswer,
                        incorrect_answer_score: penaltyPerIncorrectAnswer
                    }
                }
            }
            return q;
        }))
    }

    const onSubmit = (event) => {
        event.preventDefault();
        if (formQuestions.length === 0) {
            alert("Debes añadir al menos 1 pregunta");
            return;
        }
        if (formQuestions.some(q => q.type === "choices" && q.choices.length === 0)) {
            alert("Todas las preguntas tipo test deben tener al menos 1 respuesta");
            return;
        }
        props.onSubmitNewQuestionnaire(formTitle, formQuestions);
    }

    return <>
        {showConfigureScores &&
            <ConfigureQuestionnaireScoreDialog questions={formQuestions}
                onScoreConfigured={onScoreConfigured}
                onDismiss={() => { setShowConfigureScores(false) }} />}
        <div>
            <form onSubmit={onSubmit} className="fullScreenFormWithBottomMargin">
                <div className="formInputContainer">
                    <input className={`formInput ${primary(theme)}`} type="text" value={formTitle}
                        onChange={e => { setFormTitle(e.target.value) }}
                        maxLength={100}
                        autoFocus
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Título del formulario</label>
                </div>
                {formQuestions.map((q, idx) => {
                    if (q.type === "choices") {
                        return <NewQuestionnaireChoicesQuestion question={q}
                            questionIndex={idx}
                            setQuestionTitle={setQuestionTitle}
                            showMoveUp={idx !== 0}
                            showMoveDown={idx !== formQuestions.length - 1}
                            onMoveUp={onMoveQuestionUp}
                            onMoveDown={onMoveQuestionDown}
                            onDelete={onDeleteQuestion}
                            onAddChoice={onAddChoice}
                            onDeleteChoice={onDeleteChoice}
                            setChoiceContent={setChoiceContent}
                            onMarkUnmarkCorrectChoice={onMarkUnmarkCorrectChoice}
                            onChangeCorrectAnswerScore={onChangeCorrectAnswerScore}
                            onChangeIncorrectAnswerScore={onChangeIncorrectAnswerScore}
                            onConfigureScores={onConfigureScoresClicked} />
                    } else if (q.type === "text") {
                        return <NewQuestionnaireTextQuestion question={q}
                            questionIndex={idx}
                            setQuestionTitle={setQuestionTitle}
                            showMoveUp={idx !== 0}
                            showMoveDown={idx !== formQuestions.length - 1}
                            onMoveUp={onMoveQuestionUp}
                            onMoveDown={onMoveQuestionDown}
                            onDelete={onDeleteQuestion} />
                    } else {
                        return <div>Tipo de pregunta no conocido</div>
                    }
                })}
                <div className="questionnaireNewQuestionButtonContainer">
                    <button onClick={e => { e.preventDefault(); onAddChoicesQuestion(); }} className={`questionnaireNewQuestionButton pointable ${secondary(theme)} ${pointablePrimary(theme)}`}>
                        ➕☑️ Añadir pregunta tipo <i>test</i><br />
                        <span className="questionnaireNewQuestionSubtext">Puede ser autoevaluable</span>
                    </button>
                    <button onClick={e => { e.preventDefault(); onAddTextQuestion(); }} className={`questionnaireNewQuestionButton pointable ${secondary(theme)} ${pointablePrimary(theme)}`}>
                        ➕🖊️ Añadir pregunta de texto
                    </button>
                </div>
                <div className="formInputContainer">
                    <button className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`}>{props.submitText}</button>
                </div>
            </form>
        </div>
    </>
}

export default NewQuestionnaire;