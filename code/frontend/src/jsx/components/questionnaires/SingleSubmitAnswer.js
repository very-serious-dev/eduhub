const SingleSubmitAnswer = (props) => {

    const appropriateChoiceExtraInfo = (choiceId) => {
        if (!props.question.correct_choice_id) { return; }
        if (choiceId === props.question.correct_choice_id) { // Correct option
            if (choiceId === props.answer?.answer_id) {
                return `✔️ (+${props.question.correct_answer_score})`;
            }
            return "✔️";
        } else { // Incorrect option
            if (choiceId === props.answer?.answer_id) {
                return `❌ (-${props.question.incorrect_answer_score})`;
            }
        }
    }

    const numberToLetter = (number) => {
        return (number + 9).toString(36);
    }

    return <div className="answerContainer">
        <p className="answerQuestionTitle">Pregunta {props.question.number}: {props.question.title}</p>
        {props.question.type === "text" &&
            <p className="answerQuestionAnswer"><b>{props.answer.answer}</b></p>}
        {props.question.type === "choices" &&
            props.question.choices.toSorted((a, b) => a.number - b.number).map(choice => {
                let choiceText = <>{`${numberToLetter(choice.number)}) ${choice.content}`}</>;
                if (props.answer && props.answer.answer_id === choice.id) {
                    choiceText = <b>{choiceText}</b>
                }
                return <p className="answerQuestionAnswer">{choiceText} {appropriateChoiceExtraInfo(choice.id)}</p>
            })
        }
    </div>
}

export default SingleSubmitAnswer;