import { Outlet } from "react-router-dom";
import MainHeader from "../components/common/MainHeader";
import GetRolesFromCookie from "../../client/GetRolesFromCookie";

const MainContainer = (props) => {
    const roles = GetRolesFromCookie();

    return <div className="mainPageFlexContainer">
        <MainHeader showAdminLink={ roles.includes("sysadmin") || roles.includes("school_leader") } />
        <Outlet />
    </div>
}

export default MainContainer;