const AnimatedButton = (props) => {
    return <div className={"animatedButtonContainer" + (props.rightAligned === true ? " animatedButtonRightAligned" : "")}>
        <button onClick={props.onClick}>{props.text}</button>
        <div className="animatedButtonUnderline"></div>
    </div>
}

export default AnimatedButton;