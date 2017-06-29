import React from "react"

export default function Tools ({ dispatch, tools }) {
    return (
        <div>
            <h3>tools</h3>
            <ul>{tools.map((tool) => (
                <li key={tool}>
                    <button onClick={() => dispatch("selectTool", tool)}>
                        {tool}
                    </button>
                </li>
            ))}</ul>
        </div>
    )
}
