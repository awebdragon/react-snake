const Sidebar = (props) => {

    return (
        <div className="sidebar pt-4 pb-2 px-6 bg-surface border border-surface-light rounded-sm">
            <div className="text-center mb-3 md:mb-6">
                {props.gameOver ? (
                    <span className="text-2xl text-red-500 font-semibold">
                        Final Score: {props.score}
                    </span>
                ) : (
                    <span className="text-xl font-bold text-primary">
                        Score: {props.score}
                    </span>
                )}
            </div>

            <div className="mb-3 md:mb-6">
                <p><span className="text-secondary-light">WASD / Arrow keys</span>: change direction</p>
                <p><span className="text-secondary-light">Spacebar</span>: Pause</p>
            </div>

            {props.mode === "manual" && (
                !props.gameOver && <div className="mt-2 flex flex-col justify-center items-center">
                    <button
                        onClick={props.handlePause}
                        className="button button--primary"
                    >
                        {props.running ? "Pause" : "Start"}
                    </button>
                    <button
                        onClick={props.handleReset}
                        className="button button--secondary"
                    >
                        Reset
                    </button>
                </div>
            )}
            
        </div>
    )
}

export default Sidebar