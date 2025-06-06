import { useState, useEffect } from "react";
import { useParams } from "react-router";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import ClassDetailBodyWithHeader from "../components/classes/ClassDetailBodyWithHeader";
import { GetCachedPosts, SetCachedPosts } from "../../client/ClientCache";
import { ThemeContext } from "../main/GlobalContainer";

const ClassDetailPage = () => {
    const [classData, setClassData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [numTimesClassWasEdited, setNumTimesClassWasEdited] = useState(0);
    const params = useParams();

    useEffect(() => {
        setLoading(true);
        const cachedPosts = GetCachedPosts(params.classId);
        EduAPIFetch("GET", `/api/v1/classes/${params.classId}${cachedPosts.length > 0 ? "?newerThanPostWithId=" + cachedPosts[0].id : ""}`)
            .then(json => {
                setLoading(false);
                const mergedPosts = [...json.posts, ...cachedPosts]
                SetCachedPosts(params.classId, mergedPosts);
                const classData = json;
                classData["posts"] = mergedPosts;
                setClassData(classData);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, [numTimesClassWasEdited])

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <ThemeContext.Provider value={classData.theme}>
                <ClassDetailBodyWithHeader classData={classData} onShouldRefresh={() => { setNumTimesClassWasEdited(numTimesClassWasEdited + 1); }} />
            </ThemeContext.Provider>
}

export default ClassDetailPage;