'use strict'

import maze from './maze'
import createMazeDisplay from './createMazeDisplay'
import mouse from './mouse'
import mazeSolver from './mazeSolver'

let keys = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
}

const keyMap = {
    '38': 'up',
    '40': 'down',
    '37': 'left',
    '39': 'right'
}

window.addEventListener('keydown', (event) => {
    let keyName = keyMap[event.keyCode]

    if (keyName) {
        keys[keyName] = true
    }
})

window.addEventListener('keyup', (event) => {
    let keyName = keyMap[event.keyCode]

    if (keyName) {
        keys[keyName] = false
    }
})

window.addEventListener('load', () => {
    let mz = maze.generate({rows: 11, cols: 15})
    let mazeDisplay = createMazeDisplay(mz)

    document.body.appendChild(
        mazeDisplay.element
    )

    let mouseCell = mz.getCell({row: 0, col: 0})
    let mouseCellPos = mazeDisplay.getPos(0, 0)

    let cheeseCell = mz.getCell({row: mz.size.rows - 1, col: mz.size.cols - 1})
    let cheeseCellPos = mazeDisplay.getPos(mz.size.rows - 1, mz.size.cols - 1)
    let cheeseElement = document.createElement('img')
    cheeseElement.src = 'assets/cheese.gif'
    cheeseElement.style.position = 'absolute'
    cheeseElement.style.left = cheeseCellPos.x - 16 + 'px'
    cheeseElement.style.top = cheeseCellPos.y - 16 + 'px'
    document.body.appendChild(cheeseElement)

    window.mouse = new mouse(mouseCellPos.x, mouseCellPos.y)
    document.body.appendChild(window.mouse.element)

    let solver = new mazeSolver(mz, mouseCell, cheeseCell)

    let mouseStep = () => {
        solver.step()
        mouseCell = solver.curr
        mouseCellPos = mazeDisplay.getPos(solver.curr.data.row, solver.curr.data.col)
        return window.mouse.move(mouseCellPos.x, mouseCellPos.y, 500)
    }

    let stepLoop = () => {
        console.log(solver.curr)
        mouseStep().then(stepLoop)
    }

    stepLoop()

    /*window.addEventListener('keydown', function tryManualMove() {
        if (window.mouse.animation) {
            return
        }

        for (let keyName of ['up', 'down', 'left', 'right']) {
            if (
                keys[keyName] &&
                mouseCell.edges[keyName] &&
                mouseCell.edges[keyName].getEnabled()
            ) {
                mouseCell = mouseCell.edges[keyName].get()
                mouseCellPos = mazeDisplay.getPos(mouseCell.data.row, mouseCell.data.col)
                window.mouse.move(mouseCellPos.x, mouseCellPos.y, 500).then(tryManualMove)
                break
            }
        }
    })*/
})
