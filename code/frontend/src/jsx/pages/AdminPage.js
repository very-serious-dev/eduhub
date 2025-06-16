import { useState, useEffect } from "react";
import { EduAPIFetch } from "../../client/APIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import AdminBody from "../components/admin/AdminBody";

const AdminPage = () => {
    const [dashboardData, setDashboardData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [newlyCreatedItems, setNewlyCreatedItems] = useState(0); // Refresh key after group, class or user creation

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/admin/home")
            .then(json => {
                setLoading(false);
                setDashboardData(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, [newlyCreatedItems])

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <AdminBody dashboardData={dashboardData}
                onShouldRefresh={() => { setNewlyCreatedItems(x => x + 1); }} />

}

export default AdminPage;