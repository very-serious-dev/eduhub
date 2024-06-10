import { useState, useEffect, useContext } from "react";
import MainBody from "../components/MainBody";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import MainHeader from "../components/MainHeader";
import ErrorPage from "./ErrorPage";

const MainPage = () => {
    const [classes, setClasses] = useState([]);
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch("/api/v1/classes", options)
            .then(json => {
                setLoading(false);
                setClasses(json.classes);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
            })

    }, [])

    return isLoading ?
            <LoadingHUDPage />
            : isRequestFailed ?
                <ErrorPage />
                : <div className="mainPageFlexContainer">
                    <MainHeader />
                    <MainBody classes={classes} />
                </div>
}

export default MainPage;