import { Outlet } from "react-router";
import MainHeader from "../components/common/MainHeader";
import { GetSessionUserRoles } from "../../client/ClientCache";

const MainContainer = (props) => {
    const roles = GetSessionUserRoles();

    return <div className="mainPageFlexContainer">
        <MainHeader showAdminLink={ roles.includes("sysadmin") || roles.includes("school_leader") } />
        <Outlet />
    </div>
}

export default MainContainer;