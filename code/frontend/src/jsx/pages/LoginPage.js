import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import EduAPIFetch from "../../client/EduAPIFetch";
import LoadingHUD from "../components/common/LoadingHUD";
import DocuAPIFetch from "../../client/DocuAPIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../util/Themes";
import { ThemeContext } from "../main/GlobalContainer";
import { SetSessionInfo } from "../../client/ClientCache";

const LoginPage = () => {
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null)
    const [formUser, setFormUser] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    const onSubmitLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        EduAPIFetch("POST", "/api/v1/sessions", { username: formUser, password: formPassword })
            .then(eduJson => {
                if (eduJson.success === true) {
                    DocuAPIFetch("POST", "/api/v1/sessions", { one_time_token: eduJson.one_time_token })
                        .then(docuJson => {
                            setLoading(false);
                            if (docuJson.success === true) {
                                SetSessionInfo(eduJson.session_info)
                                navigate("/");
                            } else {
                                setError("Se ha producido un error");
                            }
                        })
                        .catch(error => {
                            setLoading(false);
                            setError(error.error ?? "Se ha producido un error");
                        })
                } else {
                    setLoading(false);
                    setError("Se ha producido un error");
                }
            })
            .catch(error => {
                setLoading(false);
                setError(error.error ?? "Se ha producido un error");
            })
    }

    return <div className="loginMain">
        <img src="/logo.png" className="loginLogo" />
        <div className="loginContainer card">
            <form onSubmit={onSubmitLogin}>
                <div className="formInputContainer">
                    <input type="text" value={formUser}
                        className={`formInput ${primary(theme)}`}
                        onChange={e => { setFormUser(e.target.value) }}
                        autoFocus
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Usuario</label>
                </div>
                <div className="formInputContainer">
                    <input type="password" value={formPassword}
                        className={`formInput ${primary(theme)}`}
                        onChange={e => { setFormPassword(e.target.value) }}
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Contraseña</label>
                </div>
                <div className="formInputContainer">
                    <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Login" />
                </div>
                {isLoading &&
                    <div className="loginHUDCentered"><LoadingHUD /></div>
                }
            </form>
        </div>
        {error !== null &&
            <div className="loginErrorContainer card">{error}</div>
        }
    </div>
}

export default LoginPage;