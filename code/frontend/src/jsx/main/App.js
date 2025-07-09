import "../../css/styles.css";

import { BrowserRouter, Routes, Route } from "react-router";
import LoginPage from "../pages/LoginPage";
import AdminPage from "../pages/AdminPage";
import MainContainer from "../pages/MainContainer";
import ClassesPage from "../pages/ClassesPage";
import FilesPage from "../pages/FilesPage";
import ErrorPage from "../pages/ErrorPage";
import ClassDetailPage from "../pages/ClassDetailPage";
import { AssignmentPage } from "../pages/AssignmentPage";
import AboutPage from "../pages/AboutPage";
import PasswordResetPage from "../pages/PasswordResetPage";
import NewQuestionnairePage from "../pages/NewQuestionnairePage";

const App = () => {

    return <BrowserRouter>
        <Routes>
            <Route path="" element={<MainContainer />}>
                <Route index element={<ClassesPage />}></Route>
                <Route path="files" element={<FilesPage/>}></Route>
                <Route path="admin" element={<AdminPage />}></Route>
            </Route>
            <Route path="login" element={<LoginPage />}></Route>
            <Route path="classes/:classId" element={<ClassDetailPage />}></Route>
            <Route path="assignments/:assignmentId" element={<AssignmentPage />}></Route>
            <Route path="create-form" element={<NewQuestionnairePage />}></Route>
            <Route path="reset-password" element={<PasswordResetPage />}></Route>
            <Route path="about" element={<AboutPage />}></Route>
            <Route path="*" element={<ErrorPage errorMessage={"404 - La página que buscas no existe"}/>}></Route>
        </Routes>
    </BrowserRouter>
}

export default App;

