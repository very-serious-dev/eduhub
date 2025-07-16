const questionnaireCreationListener = (guardFunction, onNewQuestionnaireOperationCompleted) => {
    return () => {
        if (guardFunction()) { return; }
        const newQuestionnaireChannel = new BroadcastChannel("new_questionnaire");
        newQuestionnaireChannel.onmessage = (event) => {
            if (event.data.operation === "questionnaire_added") {
                onNewQuestionnaireOperationCompleted(event.data);
            }
        }
        return () => { newQuestionnaireChannel.close() }
    }
}

export { questionnaireCreationListener }


