import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import ClassDetailBody from "../components/classes/ClassDetailBody";

const ClassDetailPage = () => {
    const [classData, setClassData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const params = useParams();

    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch(`/api/v1/classes/${params.classId}`, options)
            .then(json => {
                setLoading(false);
                setClassData(json);
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
                : <ClassDetailBody classData={classData} />
}

export default ClassDetailPage;