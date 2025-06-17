import { useState, useEffect } from "react";
import { EduAPIFetch } from "../../client/APIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import ClassesBody from "../components/classes/ClassesBody";

const ClassesPage = () => {
    const [response, setResponse] = useState({});
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        document.title = "Mis clases";
    }, []);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/classes")
            .then(json => {
                setLoading(false);
                setResponse(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, [refreshKey]);

    const onClassAdded = () => {
        setRefreshKey(x => x + 1);
    }

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <ClassesBody classes={response.classes} groups={response.groups} onClassAdded={onClassAdded} />
}

export default ClassesPage;