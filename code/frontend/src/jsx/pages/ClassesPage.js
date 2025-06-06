import { useState, useEffect } from "react";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import ClassesBody from "../components/classes/ClassesBody";
import { useNavigate } from "react-router";

const ClassesPage = () => {
    const [response, setResponse] = useState({});
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [newlyCreatedClasses, setNewlyCreatedClasses] = useState(0);
    const navigate = useNavigate();

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
                if (error.should_login) {
                    navigate("/login");
                }
            })
    }, [newlyCreatedClasses]);

    const onClassAdded = () => {
        setNewlyCreatedClasses(newlyCreatedClasses + 1);
    }

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <ClassesBody classes={response.classes} groups={response.groups} onClassAdded={onClassAdded} />
}

export default ClassesPage;