const AnimatedButton = (props) => {
    return <div className={"animatedButtonContainer" + (props.hiddenInMobile ? " hiddenInMobile" : "") + (props.rightAligned ? " animatedButtonRight" : "")}>
        <button onClick={props.onClick}>{props.text}</button>
        <div className="animatedButtonUnderline"></div>
    </div>
}

export default AnimatedButton;