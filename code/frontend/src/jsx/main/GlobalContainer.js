import GlobalUserFeedback from "../components/common/GlobalUserFeedback";
import App from "./App";
import { createContext, useEffect, useState } from "react";

const FeedbackContext = createContext(null);

const GlobalContainer = () => {
    const [desiredFeedback, setFeedback] = useState(null);
    const [actualFeedback, setActualFeedback] = useState(null);

    useEffect(() => {
        setActualFeedback(desiredFeedback);
        let timer = setTimeout(() => {
            setActualFeedback(null);
        }, 3000);
        return () => { clearTimeout(timer); }
    }, [desiredFeedback]);

    return <div>
        <FeedbackContext.Provider value={setFeedback}>
            <App />
        </FeedbackContext.Provider>
        <GlobalUserFeedback feedback={actualFeedback} />
    </div>
}

export { GlobalContainer };
export { FeedbackContext };