import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

    const [formUser, setFormUser] = useState("");
    const [formPassword, setFormPassword] = useState("");

    const navigate = useNavigate();
    
    const onSubmitLogin = (e) => {
        e.preventDefault();
        const options = {
            method: "POST",
            body: JSON.stringify({
                username: formUser,
                password: formPassword,
            }),
            credentials: "include"
        };
        fetch("http://localhost:8000/api/v1/sessions", options)
            .then(response => response.json())
            .then(data => {
                if (data.success === true) {
                    navigate("/");
                }
            });
    }

    return <div className="loginMain">
        <div className="loginContainer card">
            <form onSubmit={onSubmitLogin}>
                <div className="formInput">
                    <input type="text" value={formUser} 
                      onChange={(e) => { setFormUser(e.target.value) }} 
                      required />
                    <div className="underline"></div>
                    <label htmlFor="">Usuario</label>
                </div>
                <div className="formInput">
                    <input type="password" value={formPassword}
                      onChange={(e) => { setFormPassword(e.target.value) }}
                      required />
                    <div className="underline"></div>
                    <label htmlFor="">Contraseña</label>
                </div>
                <div className="formSubmit">
                    <input type="submit" value="Login" />
                </div>
            </form>
        </div>
    </div>
}

export default LoginPage;