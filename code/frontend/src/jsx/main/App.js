import "../../css/styles.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminPage from "../pages/AdminPage";
import MainContainer from "../pages/MainContainer";
import ClassesPage from "../pages/ClassesPage";
import FilesPage from "../pages/FilesPage";
import ErrorPage from "../pages/ErrorPage";
import ClassDetailPage from "../pages/ClassDetailPage";
import { AssignmentPage } from "../pages/AssignmentPage";

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
            <Route path="*" element={<ErrorPage errorMessage={"404 - La página que buscas no existe"}/>}></Route>
        </Routes>
    </BrowserRouter>
}

export default App;

