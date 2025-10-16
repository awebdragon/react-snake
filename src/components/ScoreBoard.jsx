const ScoreBoard = (props) => {
    return (
        <div className="text-center mb-2">
            <span className="text-xl font-bold text-primary">
                Score: {props.score}
            </span>

            {props.gameOver && (
                <span className="ml-4 text-red-500 font-semibold">
                    Final: {props.score}
                </span>
            )}
        </div>
    )
}

export default ScoreBoard