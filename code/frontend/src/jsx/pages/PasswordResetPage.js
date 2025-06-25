import { useContext, useEffect, useState } from "react";
import { FeedbackContext, ThemeContext } from "../main/GlobalContainer";
import { useNavigate, useSearchParams } from "react-router";
import { EduAPIFetch } from "../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../util/Themes";
import LoadingHUD from "../components/common/LoadingHUD";

const PasswordResetPage = () => {
    const [isLoading, setLoading] = useState(false);
    const [formPassword, setFormPassword] = useState("");
    const [formNewPassword, setFormNewPassword] = useState("");
    const [formNewPasswordConfirm, setFormNewPasswordConfirm] = useState("");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const theme = useContext(ThemeContext);
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        document.title = "Restablecer contraseña";
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        if (formNewPassword.length < 8) {
            setFeedback({ type: "info", message: "La contraseña debe tener por lo menos 8 caracteres" })
            return;
        }
        if (formNewPassword !== formNewPasswordConfirm) {
            setFeedback({ type: "info", message: "Las contraseñas deben coincidir" })
            return;
        }
        if (formPassword === formNewPassword) {
            setFeedback({ type: "info", message: "La nueva contraseña no puede ser igual a la anterior" })
            return;
        }
        setLoading(true);
        EduAPIFetch("POST", "/api/v1/passwords", { password: formPassword, new_password: formNewPassword, password_reset_token: searchParams.get("prt") })
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    setFeedback({ type: "success", message: "Contraseña establecida correctamente" })
                    navigate("/login");
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error"});
            })
    }

    return <div className="loginMain">
        <div className="loginContainer card">
            <form onSubmit={onSubmit}>
                <div className="formInputContainer">
                    <input type="password" value={formPassword}
                        className={`formInput ${primary(theme)}`}
                        onChange={e => { setFormPassword(e.target.value) }}
                        autoFocus
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Contraseña actual</label>
                </div>
                <div className="formInputContainer">
                    <input type="password" value={formNewPassword}
                        className={`formInput ${primary(theme)}`}
                        onChange={e => { setFormNewPassword(e.target.value) }}
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nueva contraseña</label>
                </div>
                <div className="formInputContainer">
                    <input type="password" value={formNewPasswordConfirm}
                        className={`formInput ${primary(theme)}`}
                        onChange={e => { setFormNewPasswordConfirm(e.target.value) }}
                        required />
                    <div className={`underline ${accent(theme)}`} />
                    <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Repetir nueva contraseña</label>
                </div>
                <div className="formInputContainer">
                    <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Cambiar contraseña" />
                </div>
                {isLoading &&
                    <div className="loadingHUDCentered"><LoadingHUD /></div>
                }
            </form>
        </div>
    </div>
}

export default PasswordResetPage;