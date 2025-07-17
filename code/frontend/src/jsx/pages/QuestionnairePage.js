import { useParams } from "react-router";
import { GetSessionUserRoles } from "../../client/ClientCache";
import { useEffect, useState } from "react";
import { EduAPIFetch } from "../../client/APIFetch";
import LoadingHUDPage from "./LoadingHUDPage";
import ErrorPage from "./ErrorPage";
import QuestionnaireBodyTeacherOverview from "../components/questionnaires/QuestionnaireBodyTeacherOverview";
import QuestionnaireBodyStudentForm from "../components/questionnaires/QuestionnaireBodyStudentForm";
import { ThemeContext } from "../main/GlobalContainer";

const QuestionnairePage = () => {
    const [questionnaireData, setQuestionnaireData] = useState();
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [requestError, setRequestError] = useState();
    const [isLoading, setLoading] = useState(true);
    const params = useParams();
    const roles = GetSessionUserRoles();

    useEffect(() => {
        document.title = "Formulario";
    }, []);

    useEffect(() => {
        let url;
        if (roles.includes("teacher")) {
            url = `/api/v1/questionnaires/${params.formId}/results`;
        } else {
            url = `/api/v1/questionnaires/${params.formId}/questions`;
        }
        EduAPIFetch("GET", url)
            .then(json => {
                setLoading(false);
                setQuestionnaireData(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
                setRequestError(error);
            });
    }, []);

    return isLoading ?
        <LoadingHUDPage />
        : isRequestFailed ?
            <ErrorPage errorMessage={requestError?.error ?? "Se ha producido un error"} showGoBack={requestError?.client_behaviour === "suggest_go_back"}/>
            : <ThemeContext.Provider value={questionnaireData?.theme}>
                {roles.includes("teacher") ?
                    <QuestionnaireBodyTeacherOverview />
                    : <QuestionnaireBodyStudentForm questionnaireData={questionnaireData} />}
            </ThemeContext.Provider>
}

export default QuestionnairePage;