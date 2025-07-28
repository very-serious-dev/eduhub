import { Link, useNavigate } from "react-router";

const ErrorPage = (props) => {
    const navigate = useNavigate();
    const errorMessage = `${props.errorMessage ?? "¡Vaya! Algo ha fallado"} 😔`;

    return <div className="errorPageMain">
        <div className="generalErrorContainer card">
            <p className="generalErrorMessage">
                {errorMessage}
                <br /><br />
                {props.suggestedAction === "go_back" &&
                    <button className="errorPageButton" onClick={() => { navigate(-1); }}>Volver</button>}
                {props.suggestedAction === "close_window" &&
                    <button className="errorPageButton" onClick={() => { window.close(); }}>Volver</button>}
                {props.suggestedAction === undefined &&
                    <>Inténtalo de nuevo más tarde o dirígete a la <Link to="/login">página de <i>login</i></Link></>}
            </p>
        </div>
    </div>
}

export default ErrorPage;