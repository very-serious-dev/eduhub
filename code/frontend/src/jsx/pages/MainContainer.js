import { Outlet, useNavigate } from "react-router";
import MainHeader from "../components/common/MainHeader";
import { GetSessionUserRoles, IsLoggedIn } from "../../client/ClientCache";
import { useEffect } from "react";

const MainContainer = (props) => {
    const roles = GetSessionUserRoles();
    const navigate = useNavigate();

    useEffect(() => {
        if (!IsLoggedIn()) {
            navigate("/login");
        }
    }, [])

    return IsLoggedIn() ? <div className="mainPageFlexContainer">
        <MainHeader showAdminLink={roles.includes("sysadmin") || roles.includes("school_leader")} />
        <Outlet />
    </div>: <></>
}

export default MainContainer;