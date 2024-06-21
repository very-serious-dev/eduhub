import "./css/main.css";
import "./css/common.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./jsx/pages/LoginPage";
import AdminPage from "./jsx/pages/AdminPage";
import MainContainer from "./jsx/pages/MainContainer";
import ClassesPage from "./jsx/pages/ClassesPage";
import MessagesPage from "./jsx/pages/MessagesPage";
import FilesPage from "./jsx/pages/FilesPage";
import ErrorPage from "./jsx/pages/ErrorPage";
import ClassDetailPage from "./jsx/pages/ClassDetailPage";

const App = () => {

    return <BrowserRouter>
        <Routes>
            <Route path="" element={<MainContainer />}>
                <Route index element={<ClassesPage />}></Route>
                <Route path="messages" element={<MessagesPage />}></Route>
                <Route path="files" element={<FilesPage/>}></Route>
                <Route path="admin" element={<AdminPage />}></Route>
            </Route>
            <Route path="login" element={<LoginPage />}></Route>
            <Route path="classes/:classId" element={<ClassDetailPage />}></Route>
            <Route path="*" element={<ErrorPage errorMessage={"404 - La página que buscas no existe"}/>}></Route>
        </Routes>
    </BrowserRouter>
}

export default App;
