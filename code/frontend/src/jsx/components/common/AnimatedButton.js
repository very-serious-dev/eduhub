const AnimatedButton = (props) => {
    return <div className="animatedButtonContainer">
        <button onClick={props.onClick}>{props.text}</button>
        <div className="animatedButtonUnderline"></div>
    </div>
}

export default AnimatedButton;