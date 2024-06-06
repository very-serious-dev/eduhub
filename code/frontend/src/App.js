import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";

import "./css/main.css";
import "./css/form.css";

const App = () => {
    return <BrowserRouter>
      <Routes>
        <Route path="" element={<MainPage />}></Route>
        <Route path="login" element={<LoginPage />}></Route>
      </Routes>
    </BrowserRouter>
}

export default App;
