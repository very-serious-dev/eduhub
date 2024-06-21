import { Outlet } from "react-router-dom";
import MainHeader from "../components/common/MainHeader";

const MainContainer = (props) => {
    return <div className="mainPageFlexContainer">
        {/* FIX-ME only show adminlink for admins. Maybe use sessionStorage after login?*/}
        <MainHeader showAdminLink={true} />
        <Outlet />
    </div>
}

export default MainContainer;