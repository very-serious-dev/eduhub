import { squashedPosts } from "../../../util/PostsUtil";
import ClassDetailAssignmentItem from "./ClassDetailAssignmentItem";
import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";

const ClassDetailDrawerSectionAssignments = (props) => {
    const assignmentsComingUp = () => {
        return squashedPosts(props.classData.posts).filter(p => p.kind === "assignment").filter(p => {
            if (p.assignment_due_date === undefined || p.assignment_due_date === null) { return true }
            const dueTime = (new Date(p.assignment_due_date)).getTime() + 86400000; // +1 day, because assignment_due_date has no hours:minutes, so it would be the same as due time 00:00h instead of 23:59h
            const nowTime = (new Date()).getTime();
            return dueTime > nowTime; 
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