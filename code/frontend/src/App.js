import "./css/main.css";
import "./css/common.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./jsx/pages/MainPage";
import LoginPage from "./jsx/pages/LoginPage";
import AdminPage from "./jsx/pages/AdminPage";

const App = () => {

    return <BrowserRouter>
            <Routes>
                <Route path="" element={<MainPage />}></Route>
                <Route path="admin" element={<AdminPage />}></Route>
                <Route path="login" element={<LoginPage />}></Route>
            </Routes>
        </BrowserRouter>
}

export default App;
