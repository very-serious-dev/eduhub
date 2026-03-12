import { useState, useEffect } from "react";
import { EduAPIFetch } from "../../client/APIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import CompaniesBody from "../components/traineeships/CompaniesBody";

const TraineeshipsPage = () => {
    const [companiesData, setCompaniesData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        document.title = "Empresas";
    }, []);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/companies")
            .then(json => {
                setLoading(false);
                setCompaniesData(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestErrorMessage(error.error ?? "Se ha producido un error");
            })
    }, [refreshKey])

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestErrorMessage} />
            : <CompaniesBody companiesData={companiesData}
                onShouldRefresh={() => { setRefreshKey(x => x + 1); }} />

}

export default TraineeshipsPage;