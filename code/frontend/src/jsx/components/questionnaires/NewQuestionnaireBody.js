import { useContext, useState } from "react";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, accentFormLabel, pointablePrimary, pointableSecondary, primary, secondary } from "../../../util/Themes";
import NewQuestionnaireChoicesQuestion from "./NewQuestionnaireChoicesQuestion";
import NewQuestionnaireTextQuestion from "./NewQuestionnaireTextQuestion";
import ConfigureQuestionnaireScoreDialog from "../dialogs/ConfigureQuestionnaireScoreDialog";
import AddManyTextQuestionsDialog from "../dialogs/AddManyTextQuestionsDialog";

const NewQuestionnaireBody = (props) => {
    const [formTitle, setFormTitle] = useState(props.questionnaireBeingEdited ? props.questionnaireBeingEdited.title : "");
    const [formMode, setFormMode] = useState(props.questionnaireBeingEdited ? props.questionnaireBeingEdited.mode : "regular");
    const [formQuestions, setFormQuestions] = useState(props.questionnaireBeingEdited ? [...props.questionnaireBeingEdited.questions] : []);
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CONFIGURE_SCORES, ADD_MANY_TEST_QUESTIONS
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

    const onAddManyChoicesQuestions = () => {
        setPopupShown("ADD_MANY_TEXT_QUESTIONS")
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
        setPopupShown("CONFIGURE_SCORES");
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
        props.onSubmitNewQuestionnaire(formTitle, formMode, formQuestions);
    }

    const formModeHint = () => {
        return formMode === "secret_answers" ? "👁️ Los estudiantes no verán las respuestas que teclean en pantalla, como si escribieran una contraseña. Escoge esta opción si este formulario debe realizarse en el aula como un examen" : "Los estudiantes responden de forma convencional, y pueden ver sus respuestas en pantalla a medida que contestan";
    }

    const onAddManyTestQuestionsFromPlaintext = (text) => {
        const newQuestions = []
        const lines = text.split('\n');
        let currentQuestion = {
            type: "choices",
            title: "",
            choices: [],
            correct_answer_score: 1,
            incorrect_answer_score: 0
        }
        for (let line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) { // White line. Add the question and start over
                newQuestions.push({ ...currentQuestion });
                currentQuestion = {
                    type: "choices",
                    title: "",
                    choices: [],
                    correct_answer_score: 1,
                    incorrect_answer_score: 0
                }
            } else {
                if (trimmedLine.startsWith("a)") || trimmedLine.startsWith("b)") || trimmedLine.startsWith("c)") || trimmedLine.startsWith("d)") || trimmedLine.startsWith("e)") || trimmedLine.startsWith("f)") || trimmedLine.startsWith("g)") || trimmedLine.startsWith("h)")) {
                    if (trimmedLine.endsWith("(Correcta)") || trimmedLine.endsWith("(Correct)")) {
                        const trimmedLineWithoutSuffix = trimmedLine.replace("(Correcta)", "").replace("(Correct)", "");
                        currentQuestion.choices.push({ content: trimmedLineWithoutSuffix.slice(2).trim(), is_correct: true })
                    } else {
                        currentQuestion.choices.push({ content: trimmedLine.slice(2).trim(), is_correct: false })
                    }
                } else {
                    currentQuestion.title = trimmedLine;
                }
            }
        }
        if (currentQuestion.title.length > 0) {
            // The plaintext didn't finish in a newline, so here let's add the last question
            newQuestions.push(currentQuestion);
        }
        setFormQuestions(old => old.concat(newQuestions));
    }

    return <>
        {popupShown === "CONFIGURE_SCORES" &&
            <ConfigureQuestionnaireScoreDialog questions={formQuestions}
                onScoreConfigured={onScoreConfigured}
                onDismiss={() => { setPopupShown("NONE") }} />}
        {popupShown === "ADD_MANY_TEXT_QUESTIONS" &&
            <AddManyTextQuestionsDialog onPlainTextSubmit={onAddManyTestQuestionsFromPlaintext}
                onDismiss={() => { setPopupShown("NONE") }} />}
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
                <div className={"formInputSelectContainer selectWithTopMargin addUserSelect"}>
                    <select name="questionnaireMode"
                        value={formMode}
                        className={`formInputSelect ${primary(theme)}`}
                        onChange={e => { setFormMode(e.target.value); }}>
                        <option value="regular">Normal</option>
                        <option value="secret_answers">Respuesta oculta</option>
                    </select>
                </div>
                <div className="questionnaireModeHint">{formModeHint()}</div>
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
                    <button onClick={e => { e.preventDefault(); onAddTextQuestion(); }} className={`questionnaireNewQuestionButton pointable ${secondary(theme)} ${pointablePrimary(theme)}`}>
                        ➕🖊️ Añadir pregunta de texto
                    </button>
                    <button onClick={e => { e.preventDefault(); onAddChoicesQuestion(); }} className={`questionnaireNewQuestionButton pointable ${secondary(theme)} ${pointablePrimary(theme)}`}>
                        ➕☑️ Añadir pregunta tipo <i>test</i><br />
                        <span className="questionnaireNewQuestionSubtext">Puede ser autoevaluable</span>
                    </button>
                    <button onClick={e => { e.preventDefault(); onAddManyChoicesQuestions(); }} className={`questionnaireNewQuestionButton pointable ${secondary(theme)} ${pointablePrimary(theme)}`}>
                        ➕🧠 Añadir varias preguntas <i>test</i>
                    </button>
                </div>
                <div className="formInputContainer">
                    <button className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`}>{props.submitText}</button>
                </div>
            </form>
        </div>
    </>
}

export default NewQuestionnaireBody;