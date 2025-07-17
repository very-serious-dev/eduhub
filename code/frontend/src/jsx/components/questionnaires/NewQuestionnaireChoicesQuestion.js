import { useContext } from "react";
import NewQuestionnaireQuestionHeader from "./NewQuestionnaireQuestionHeader";
import { ThemeContext } from "../../main/GlobalContainer";
import { primary } from "../../../util/Themes";
import NewQuestionnaireChoicesQuestionScore from "./NewQuestionnaireChoicesQuestionScore";

const NewQuestionnaireChoicesQuestion = (props) => {
    const theme = useContext(ThemeContext);

    return <div key={props.questionIndex}>
        <div className="card questionnaireQuestionContainer">
            <NewQuestionnaireQuestionHeader questionIndex={props.questionIndex}
                questionTitle={props.question.title}
                setQuestionTitle={props.setQuestionTitle}
                showMoveUp={props.showMoveUp}
                showMoveDown={props.showMoveDown}
                onMoveUp={props.onMoveUp}
                onMoveDown={props.onMoveDown}
                onDelete={props.onDelete} />
            {props.question.choices.some(choice => choice.is_correct === true) &&
                <NewQuestionnaireChoicesQuestionScore questionIndex={props.questionIndex}
                    question={props.question}
                    onChangeCorrectAnswerScore={props.onChangeCorrectAnswerScore}
                    onChangeIncorrectAnswerScore={props.onChangeIncorrectAnswerScore}
                    onConfigureScores={props.onConfigureScores} />}
            {props.question.choices.map((choice, choiceIdx) => {
                return <div key={choiceIdx} className="questionnaireNewQuestionChoiceContainer">
                    <input type="radio" disabled />
                    <input className={`questionnaireNewQuestionChoice ${primary(theme)}`} type="text" value={choice.content}
                        onChange={e => { props.setChoiceContent(props.questionIndex, choiceIdx, e.target.value) }}
                        maxLength={500}
                        placeholder={`Escribe aquí la opción ${choiceIdx + 1}`}
                        required />
                    {choice.is_correct && <><span className="questionnaireCorrectChoice">✔️</span><span className="questionnaireCorrectChoice">Opción correcta</span></>}
                    <div className="questionnaireNewQuestionMarkCorrectChoice pointable" onClick={() => { props.onMarkUnmarkCorrectChoice(props.questionIndex, choiceIdx) }}>☑️</div>
                    <div className="questionnaireNewQuestionDelete pointable" onClick={() => { props.onDeleteChoice(props.questionIndex, choiceIdx) }}>❌</div>
                </div>
            })}
            <button onClick={(event) => { event.preventDefault(); props.onAddChoice(props.questionIndex) }} className="questionnaireNewQuestionChoicesAddButton pointable">
                ➕ Añadir opción
            </button>
        </div>
    </div>
}

export default NewQuestionnaireChoicesQuestion;