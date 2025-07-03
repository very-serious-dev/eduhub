import { squashedPosts } from "../../../util/PostsUtil";
import ClassDetailAssignmentItem from "./ClassDetailAssignmentItem";
import ClassDetailDrawerSectionTitle from "./ClassDetailDrawerSectionTitle";

const ClassDetailDrawerSectionAssignments = (props) => {
    const assignmentsComingUp = () => {
        return squashedPosts(props.classData.posts).filter(p => p.kind === "assignment").filter(p => {
            if (p.assignment_due_date === undefined || p.assignment_due_date === null) { return true }
            const due = new Date(p.assignment_due_date)
            const now = new Date()
            return due > now; 
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