import ClassCell from "./ClassCell";

const ClassesBody = (props) => {

    return <div className="mainBodyClasses"><p>Under construction!</p>
        { props.classes.map( c => <ClassCell class={c} />)}
    </div>
}

export default ClassesBody;