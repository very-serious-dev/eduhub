import NewQuestionnaireQuestionHeader from "./NewQuestionnaireQuestionHeader";

const NewQuestionnaireTextQuestion = (props) => {

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
            <div className="formInputContainer">
                <input className="formInput formInputGreyBackground"
                    type="text"
                    value="Aquí los estudiantes podrán escribir su respuesta..." disabled={true} />
            </div>
        </div>
    </div>
}

export default NewQuestionnaireTextQuestion;



