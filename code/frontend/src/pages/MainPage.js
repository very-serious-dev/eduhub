import MainBody from "../components/MainBody";

const MainPage = () => {
    return <div class="mainPageFlexContainer">
        <div class="mainPageFlexHeader">
            <p>Header</p>
        </div>
        <div class="mainPageFlexBody">
            <MainBody />
        </div>
        <div class="mainPageFlexFooter">
            <p>Footer</p>
        </div>
    </div>
}

export default MainPage;