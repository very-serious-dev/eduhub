import { Link } from "react-router-dom";

const ErrorPage = () => {
    return <div className="errorPageMain">
        <div className="generalErrorContainer card">
            <p className="generalErrorMessage">¡Vaya! Algo ha fallado 😔 <br />Inténtalo de nuevo más tarde o dirígete a la <Link to="/login">página de <i>login</i></Link></p>
        </div>
    </div>
}

export default ErrorPage;