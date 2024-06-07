import { useEffect, useState } from "react";
import ClassCell from "./ClassCell";

const MainBodyClasses = () => {

    const [classes, setClasses] = useState([])

    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        fetch("http://localhost:8000/api/v1/classes", options)
            .then(response => response.json())
            .then(data => {
                setClasses(data.classes)
            });
    }, [])

    return <div className="mainBodyClasses card">
        { classes.map( c => <ClassCell class={c} />)}
    </div>
}

export default MainBodyClasses;