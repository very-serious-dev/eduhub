import TabbedActivity from "../common/TabbedActivity";
import CreateOrEditPostForm from "../posts/CreateOrEditPostForm";

const CreatePostDialog = (props) => {

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <TabbedActivity tabs={[
                    {
                        title: "Nueva publicación",
                        view: <CreateOrEditPostForm postType="publication"
                            classIdForPostCreation={props.classId}
                            postBeingEdited={null}
                            units={props.units}
                            titlePlaceholder="Filósofos del empirismo"
                            contentPlaceholder={"Los filósofos empiristas que entran en el examen son:\n\n- John Locke\n- Thomas Hobbes\n- George Berkeley\n- etc."}
                            submitText="Publicar"
                            showDatePicker={false}
                            showDeleteButton={false}
                            onFinished={props.onFinished}
                            onDismiss={props.onDismiss} />
                    },
                    {
                        title: "Nueva tarea",
                        view: <CreateOrEditPostForm postType="assignment"
                            classIdForPostCreation={props.classId}
                            postBeingEdited={null}
                            units={props.units}
                            titlePlaceholder="Trabajo sobre la máquina de vapor"
                            contentPlaceholder={"Se debe subir un PDF sobre el tema de la máquina de vapor, con estos apartados:\n\n1. Año de invención y contexto histórico\n2. Inventor, historia\n3. Funcionamiento de la máquina de vapor\n4. Efecto en la industria y a nivel mundial\n\nHasta 1 punto extra sobre la nota del examen\nSe valorará el formato del documento y la gramática"}
                            submitText="Crear tarea"
                            showDatePicker={true}
                            showDeleteButton={false}
                            onFinished={props.onFinished}
                            onDismiss={props.onDismiss} />
                    }]}
                    tabContentWidthPercentage={100}
                    showTitles={true} />
            </div>
        </div></div> : <></>
}

export default CreatePostDialog;