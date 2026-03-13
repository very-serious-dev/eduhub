import { useState, useEffect } from "react";
import CompanyDetailBody from "./CompanyDetailBody";
import { EduAPIFetch } from "../../../client/APIFetch";
import { useParams } from "react-router";
import LoadingHUDPage from "../../pages/LoadingHUDPage";
import ErrorPage from "../../pages/ErrorPage";


const CompanyDetailPage = () => {
    const [companyData, setCompanyData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestErrorMessage, setRequestErrorMessage] = useState();
    const [isLoading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const params = useParams();

    useEffect(() => {
        document.title = "Empresas";
    }, []);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/companies/" + params.companyId)
            .then(json => {
                setLoading(false);
                setCompanyData(json);
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
            : <CompanyDetailBody companyData={companyData}
                onShouldRefresh={() => { setRefreshKey(x => x + 1); }} />

}

export default CompanyDetailPage;