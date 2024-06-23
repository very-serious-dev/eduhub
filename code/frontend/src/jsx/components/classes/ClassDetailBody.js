import UserCard from "../common/UserCard"
import ClassDetailEntryCard from "./ClassDetailEntryCard";

const ClassDetailBody = (props) => {
    return <div className="classDetailBodyContainer">
        <div className="classDetailBodyColumn1">
            {props.classData.entries.map(e => <ClassDetailEntryCard entry={e} />)}
        </div>
        <div className="classDetailBodyColumn2">
            <div>
                <div className="classDetailColumn2SectionTitle">👤 Profesores</div>
                <div className="classDetailColumn2SectionUnderline" />
                {props.classData.teachers.map(t => { return <UserCard user={t} /> })}
            </div>
            <div>
                <div className="classDetailColumn2SectionTitle">💼 Próximas entregas</div>
                <div className="classDetailColumn2SectionUnderline" />
                <p>
                    No hay entregas próximas
                </p>
            </div>
            <div>
                <div className="classDetailColumn2SectionTitle">📚 Temario</div>
                <div className="classDetailColumn2SectionUnderline" />
                <p>
                    No hay temas
                </p>
            </div>
        </div>
    </div>

}

export default ClassDetailBody;