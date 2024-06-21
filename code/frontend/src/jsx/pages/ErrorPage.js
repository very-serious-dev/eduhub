import { Link } from "react-router-dom";

const ErrorPage = (props) => {
    const errorMessage = `${props.errorMessage ?? "¡Vaya! Algo ha fallado"} 😔`

    return <div className="errorPageMain">
        <div className="generalErrorContainer card">
            <p className="generalErrorMessage">{errorMessage}<br /><br />Inténtalo de nuevo más tarde o dirígete a la <Link to="/login">página de <i>login</i></Link></p>
        </div>
    </div>
}

export default ErrorPage;