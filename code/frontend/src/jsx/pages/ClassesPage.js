import { useState, useEffect } from "react";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import ClassesBody from "../components/classes/ClassesBody";

const ClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);

    // TO-DO Work on this
    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch("/api/v1/classes", options)
            .then(json => {
                setLoading(false);
                setClasses(json.classes);
                console.log(json)
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                if (error.error) {
                    setRequestErrorMessage(error.error);
                }
            })
    }, [])

    return isLoading ?
            <LoadingHUDPage />
            : isRequestFailed ?
                <ErrorPage errorMessage={requestErrorMessage} />
                : <ClassesBody classes={classes} />
}

export default ClassesPage;