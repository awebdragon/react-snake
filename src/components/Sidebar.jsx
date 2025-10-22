const Sidebar = (props) => {

    return (
        <div className="sidebar md:w-4/12 pt-4 pb-2 px-6 bg-surface border border-surface-light rounded-sm">
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

            <div className="mb-4 md:mb-8">
                {props.mode === "manual" && <p><span className="text-secondary-light">WASD / Arrow keys</span>: change direction</p>}
                {props.mode === "manual" && <p><span className="text-secondary-light">Spacebar</span>: Pause</p>}
            </div>

            {!props.gameOver && (
                <div className="flex flex-col justify-center items-center">
                    
                    <label className="inline-flex items-center cursor-pointer mb-4">
                        <input type="checkbox" value="" className="sr-only peer" checked={props.isChecked} onChange={props.handleToggle} />

                        <div className="relative w-11 h-6 bg-stone-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>

                        <span className="ms-3 text-sm font-medium">Toggle Game Mode<span className="sr-only">Current mode: {props.mode}</span></span>
                    </label>

                    {props.mode === "manual" && (
                        <button onClick={props.handlePause} className="button button--primary">
                            {props.running ? "Pause" : "Start"}
                        </button>
                    )}

                    <button
                        onClick={props.handleReset}
                        className="button text-text-inverse bg-stone-300 hover:bg-stone-400"
                    >
                        Reset
                    </button>
                </div>
            )}
            
        </div>
    )
}

export default Sidebar