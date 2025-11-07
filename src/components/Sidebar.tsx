// setting types and learning TypeScript
type SidebarProps = {
  gameOver: boolean
  score: number
  mode: "manual" | "auto" // this means mode is expecting one of two options, and no others are allowed even if they're also strings
  isChecked: boolean
  handleToggle: () => void
  handlePause?: () => void // this ?: tells typescript that this prop is optional - we can only pause in one of the modes, so it isn't used in the other
  handleReset: () => void
  running?: boolean
}

// everything below can stay the same, because we aren't making edits to the rest of the logic - all our types this component is using are declared above. The only thing left to do is update line 15, const Sidebar = (props) => {

const Sidebar = (props: SidebarProps) => {
    // we could also destructure the above if we wanted, but I don't feel like that's necessary in this case, or maybe ever. This structure looks clean and readable to me. But, if you wanted to see what that would look like:
    /**
    const Sidebar = ({
    gameOver,
    score,
    mode,
    isChecked,
    handleToggle,
    handlePause,
    handleReset,
    running
    }: SidebarProps) => {
     */

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
                    
                    <label className="flex flex-col items-center mb-6">
                        <span className="text-sm font-medium text-text text-secondary-light mb-3">Game Mode</span>

                        <div className="cursor-pointer flex items-center gap-3">
                            <span className="text-xs">Manual</span>

                            <input type="checkbox" value="" className="sr-only peer" checked={props.isChecked} onChange={props.handleToggle} aria-label={`Toggle game mode (currently ${props.mode})`} />

                            <div className="relative w-11 h-6 bg-stone-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary-darkest peer-focus-visible:ring-4 peer-focus-visible:ring-tertiary-lightest"></div>

                            <span className="text-xs">Auto</span>
                        </div>
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