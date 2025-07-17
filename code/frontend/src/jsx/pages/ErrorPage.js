import { Link, useNavigate } from "react-router";

const ErrorPage = (props) => {
    const navigate = useNavigate();
    const errorMessage = `${props.errorMessage ?? "¡Vaya! Algo ha fallado"} 😔`;


    return <div className="errorPageMain">
        <div className="generalErrorContainer card">
            <p className="generalErrorMessage">
                {errorMessage}
                <br /><br />
                {props.showGoBack
                    ? <a href="#" onClick={() => { navigate(-1); }}>Volver</a>
                    : <>Inténtalo de nuevo más tarde o dirígete a la <Link to="/login">página de <i>login</i></Link></>}
            </p>
        </div>
    </div>
}

export default ErrorPage;