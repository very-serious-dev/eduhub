import GroupClassesSection from "./GroupClassesSection";

const ClassesBody = (props) => {

    const sections = () => {
        // Elegant reduce (I hope so) to transform an array like this:
        //
        // [{"name": "Philosophy", "group": "BACH1"},
        //  {"name": "Chemistry", "group": "BACH1"},
        //  {"name": "Maths", "group": "BACH2"}]
        //
        // ...into this:
        // {
        //   "BACH1": [{"name": "Philosophy", "group": "BACH1"},
        //             {"name": "Chemistry", "group": "BACH1"}],
        //   "BACH2": [{"name": "Maths", "group": "BACH2"}]
        // }
        // ...so that it can be easily presented in different sections.
        return props.classes.reduce(
            (groups, currentClass) => {
                if (!(currentClass.group in groups)) {
                    groups[currentClass.group] = []
                }
                groups[currentClass.group].push(currentClass);
                return groups
            }, {})
    }

    return <div className="mainBodyClasses">
        {Object.entries(sections()).map(([groupTag, classes])=> {
            return <GroupClassesSection group={groupTag}
                classes={classes} />
        })}
    </div>
}

export default ClassesBody;