const GlobalUserFeedback = (props) => {
    const classNameForFeedbackType = (feedbackType) => {
        if (feedbackType === "info") { return "globalUserFeedbackInfo" }
        if (feedbackType === "error") { return "globalUserFeedbackError" }
        if (feedbackType === "success") { return "globalUserFeedbackSuccess" }
        return ""
    }

    const emojiForFeedbackType = (feedbackType) => {
        if (feedbackType === "info") { return "💬" }
        if (feedbackType === "error") { return "❌" }
        if (feedbackType === "success") { return "✔️" }
        return ""
    }

    return props.feedback !== null ? 
        <div className={"globalUserFeedback " + classNameForFeedbackType(props.feedback.type)}>{emojiForFeedbackType(props.feedback.type) + " " + props.feedback.message}</div>
    : <></>
}

export default GlobalUserFeedback;