import { useState, useEffect } from "react";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import MainHeader from "../components/main/MainHeader";
import ErrorPage from "./ErrorPage";
import AdminBody from "../components/admin/AdminBody";

const AdminPage = () => {
    const [dashboardData, setDashboardData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch("/api/v1/admin/home", options)
            .then(json => {
                setLoading(false);
                setDashboardData(json);
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
                    <MainHeader showAdminLink={false}/>
                    <AdminBody dashboardData={dashboardData}/>
                </div>
}

export default AdminPage;