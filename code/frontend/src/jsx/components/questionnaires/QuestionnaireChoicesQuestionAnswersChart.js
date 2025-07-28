const QuestionnaireChoicesQuestionAnswersChart = (props) => {

    const choicesWithPlotData = props.choices.map(choice => {
        const nTimesAnswered = props.answers.reduce((acum, answer) => {
            if (answer.answer_id === choice.id) {
                return acum + 1;
            }
            return acum;
        }, 0);
        return { ...choice, numberOfTimesChosen: nTimesAnswered }
    });

    const mostChosenChoiceTimes = choicesWithPlotData.reduce((acum, choice) => Math.max(acum, choice.numberOfTimesChosen), 0);

    const backgroundColorForChoice = (index) => {
        if (index % 6 === 0) {
            return "#6B67F3"
        } else if (index % 6 === 1) {
            return "#A722FF"
        } else if (index % 6 === 2) {
            return "#F34D8A"
        } else if (index % 6 === 3) {
            return "#F29437"
        } else if (index % 6 === 4) {
            return "#E2E221"
        } else if (index % 6 === 5) {
            return "#81E221"
        }
    }

    return <div className="allSubmitsChoicesQuestionChartContainer">
        {choicesWithPlotData.map((choiceData, idx) => {
            const maxWidthInViewportPerc = 50;
            const choicePlotWidth = Math.trunc((choiceData.numberOfTimesChosen / mostChosenChoiceTimes) * maxWidthInViewportPerc);

            return <div className="choicesQuestionChartChoiceContainer" key={`choice${idx}`}>
                <div className="choicesQuestionChartChoicePlotContainer">
                    <div className="choicesQuestionChartChoicePlot" style={{ width: `${choicePlotWidth}vw`, backgroundColor: backgroundColorForChoice(idx) }} />
                    <div className="choicesQuestionChartChoiceNTimesChosen">{choiceData.numberOfTimesChosen}</div>
                </div>
                <div className="choicesQuestionChartChoiceContent">{choiceData.content}</div>
            </div>
        })}
    </div>
}

export default QuestionnaireChoicesQuestionAnswersChart;