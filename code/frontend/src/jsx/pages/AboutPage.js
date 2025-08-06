import { useEffect } from "react";

const AboutPage = () => {

    useEffect(() => {
        document.title = "Acerca de";
    }, []);

    return <div className="aboutPageContainer">
        <h1>Esto es 📘🌴🏖️ EduPlaya</h1>
        <p>Plataforma educativa de código abierto de filosofía minimalista:</p>
        <ul>
            <li>Crea y edita grupos, clases y usuarios</li>
            <li>Permite a tus profesores gestionar sus clases: Participantes, publicaciones, tareas, entregas, calificaciones...</li>
            <li>Espacio de almacenamiento: Gestiona tus archivos y compártelos</li>
            <li>Formularios autoevaluables</li>
        </ul>
        <p>Si encuentras algún problema o quieres sugerir mejoras, no dudes en contactar con la administración de tu organización.</p>
        <p>¡Estamos deseando mejorar! ♥️</p>
        <div className="aboutPageCreativeCommonsMessage">Creative Commons: <a href="https://www.flaticon.com/free-icons/doc" title="doc icons">Doc icons created by Dimitry Miroliubov - Flaticon</a></div>
    </div>

}

export default AboutPage;