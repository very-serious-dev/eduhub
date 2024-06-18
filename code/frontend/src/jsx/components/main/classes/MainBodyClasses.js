import ClassCell from "./ClassCell";

const MainBodyClasses = (props) => {

    return <div className="mainBodyClasses">
        { props.classes.map( c => <ClassCell class={c} />)}
    </div>
    // TO-DO meter botón para añadir clase
}

export default MainBodyClasses;