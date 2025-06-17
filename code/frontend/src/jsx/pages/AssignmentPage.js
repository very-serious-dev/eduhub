import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ErrorPage from "./ErrorPage";
import AssignmentBody from "../components/assignments/AssignmentBody";
import { EduAPIFetch } from "../../client/APIFetch";
import { ThemeContext } from "../main/GlobalContainer";

const ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID = (id) => `assignmentWithId${id}Title`;
const ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID = (id) => `assignmentWithId${id}Content`;

const AssignmentPage = (props) => {
    const [assignmentData, setAssignmentData] = useState({ title: "", content: "", theme: "" });
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [numTimesChanged, setNumTimesChanged] = useState(0); // refresh key after student submit
    const params = useParams();

    useEffect(() => {
        document.title = "Tarea";
    }, []);

    useEffect(() => {
        setLoading(true);
        EduAPIFetch("GET", `/api/v1/assignments/${params.assignmentId}`)
            .then(json => {
                setLoading(false);
                setAssignmentData(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, [numTimesChanged]);

    useEffect(() => {
        const assignmentTitleBeforeNavigation = sessionStorage.getItem(ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID(params.assignmentId));
        const assignmentContentBeforeNavigation = sessionStorage.getItem(ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID(params.assignmentId));
        if ((assignmentTitleBeforeNavigation !== undefined) && (assignmentContentBeforeNavigation !== undefined)) {
            setAssignmentData({
                title: assignmentTitleBeforeNavigation,
                content: assignmentContentBeforeNavigation
            })
        }
    }, [])

    const onScoreChanged = (result) => {
        if (result.operation === "score_updated") {
            setAssignmentData(old => {
                const updatedSubmit = old.submits.find(s => s.author.username === result.author_username);
                updatedSubmit.score = result.score;
                updatedSubmit.is_score_published = result.is_score_published;
                const newSubmits = old.submits.filter(s => s.author.username === result.author_username).concat(updatedSubmit);
                return { ...old, newSubmits }
            });
        }
        if (result.operation === "score_deleted") {
            setAssignmentData(old => {
                const updatedSubmit = old.submits.find(s => s.author.username === result.author_username);
                updatedSubmit.score = undefined;
                updatedSubmit.is_score_published = undefined;
                const newSubmits = old.submits.filter(s => s.author.username === result.author_username).concat(updatedSubmit);
                return { ...old, newSubmits }
            });
        }
    }

    return isRequestFailed ?
        <ErrorPage errorMessage={requestErrorMessage} />
        : <ThemeContext.Provider value={assignmentData.theme}>
            <AssignmentBody assignmentData={assignmentData}
                isLoading={isLoading}
                onShouldRefresh={() => { setNumTimesChanged(x => x + 1) }}
                onScoreChanged={onScoreChanged} />
        </ThemeContext.Provider>
}

export { AssignmentPage };
export { ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID };
export { ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID };