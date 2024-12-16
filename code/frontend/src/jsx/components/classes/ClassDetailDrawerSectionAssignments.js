import ClassDetailAssignmentItem from "./ClassDetailAssignmentItem";
import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";

const ClassDetailDrawerSectionAssignments = (props) => {
    const assignmentsComingUp = () => {
        return props.classData.posts.filter(p => p.kind === "task").filter(p => {
            if (p.taskDueDate === undefined) { return true }
            const taskTime = (new Date(p.taskDueDate)).getTime() + 86400000; // +1 day, because taskDueDate has no hours:minutes, so it would be the same as due time 00:00h instead of 23:59h
            const nowTime = (new Date()).getTime();
            return taskTime > nowTime; 
        })
    }

    return <div>
        <ClassDetailDrawerSectionTitle title="📅 Próximas entregas" />
        { assignmentsComingUp().length > 0 ? 
            assignmentsComingUp().map(a => <ClassDetailAssignmentItem assignment={a} />) :
            <p>No hay entregas próximas</p> }
        
    </div>
}

export default ClassDetailDrawerSectionAssignments;