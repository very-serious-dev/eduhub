import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import AssignmentBody from "../components/assignments/AssignmentBody";
import EduAPIFetch from "../../client/EduAPIFetch";

const ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID = (id) => `assignmentWithId${id}Title`;
const ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID = (id) => `assignmentWithId${id}Content`;

const AssignmentPage = (props) => {
    const [assignmentData, setAssignmentData] = useState({ title: "", content: "" });
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [numTimesChanged, setNumTimesChanged] = useState(0); // refresh key after student submit
    const params = useParams();

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

    return isRequestFailed ?
        <ErrorPage errorMessage={requestErrorMessage} />
        : <AssignmentBody assignmentData={assignmentData}
            isLoading={isLoading}
            onShouldRefresh={() => { setNumTimesChanged(x => x + 1) }} />
}

export { AssignmentPage };
export { ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID };
export { ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID };