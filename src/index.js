'use strict'

import maze from './maze'
import createMazeDisplay from './createMazeDisplay'
import mouse from './mouse'
import sockception from 'sockception'

let startNewGame = (edges, pos, onUpdate) => {
    // Clear current document
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild)
    }

    let mz = maze.grid(edges)
    let mazeDisplay = createMazeDisplay(mz)

    document.body.appendChild(
        mazeDisplay.element
    )

    let mouseCellPos = mazeDisplay.getPos(pos.row, pos.col)

    let cheeseCellPos = mazeDisplay.getPos(mz.size.rows - 1, mz.size.cols - 1)
    let cheeseElement = document.createElement('img')
    cheeseElement.src = 'assets/cheese.gif'
    cheeseElement.style.position = 'absolute'
    cheeseElement.style.left = cheeseCellPos.x - 16 + 'px'
    cheeseElement.style.top = cheeseCellPos.y - 16 + 'px'
    document.body.appendChild(cheeseElement)

    window.mouse = new mouse(mouseCellPos.x, mouseCellPos.y)
    document.body.appendChild(window.mouse.element)

    onUpdate((update) => {
        let mouseCellPos = mazeDisplay.getPos(update.pos.row, update.pos.col)

        window.mouse.move(mouseCellPos.x, mouseCellPos.y, 500).then(() => {
            console.log(update.stepCount + ' / ' + update.stepMax)
        })
    })
}

window.addEventListener('load', () => {
    let sock = sockception.connect('ws://localhost:56657')

    sock.route('connected').receiveOne(() => {
        let updateHandler = () => {}

        sock.route('getStarts').send().receiveMany((res) => {
            startNewGame(
                res.value,
                {row: 0, col: 0},
                handler => updateHandler = handler
            )
        })

        sock.route('getUpdates').send().receiveMany(res => updateHandler(res.value))

        sock.route('getStops').receiveMany((res) => {
            setTimeout(console.log(res.value), 500)
        })

        sock.route('getCurrent').send().receiveOne((res) => {
            if (res.value === null) {
                sock.route('start').send()
            } else {
                startNewGame(
                    res.value.edges,
                    res.value.update.pos,
                    handler => updateHandler = handler
                )
            }
        })
    })
})
