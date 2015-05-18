'use strict'

let shuffle = require('lodash/collection/shuffle')
let all = require('lodash/collection/all')

let maze = {}
export default maze

maze.checkEdgesAndGetSize = (edges) => {
    if (!Array.isArray(edges.horizontal)) {
        return null
    }

    if (!Array.isArray(edges.vertical)) {
        return null
    }

    const rows = edges.vertical.length
    const cols = edges.horizontal[0].length

    if (
        all(edges.vertical, row => Array.isArray(row) && row.length === cols + 1) &&
        all(edges.horizontal, row => Array.isArray(row) && row.length === cols) &&
        all([edges.vertical, edges.horizontal],
            e => all(e,
                row => all(row,
                    edgeUnit => typeof edgeUnit === 'boolean'
                )
            )
        )
    ) {
        return {rows, cols}
    }

    return null
}

maze.grid = (edges) => {
    let api = {}

    api.size = maze.checkEdgesAndGetSize(edges)

    if (!api.size) {
        throw new Error("Invalid edges")
    }

    api.edges = edges

    api.checkPos = ({row, col}) => (
        0 <= row && row < api.size.rows &&
        0 <= col && col < api.size.cols
    )

    api.getCell = ({row, col}) => {
        if (!api.checkPos({row, col})) {
            throw new Error('Invalid pos')
        }

        const createEdge = (pos) => {
            if (!api.checkPos(pos)) {
                return null
            }

            const matrix = (
                pos.row !== row ?
                api.edges.horizontal :
                api.edges.vertical
            )

            const edgePos = {
                row: Math.max(row, pos.row),
                col: Math.max(col, pos.col)
            }

            return {
                getEnabled() { return matrix[edgePos.row][edgePos.col] },
                setEnabled(val) { matrix[edgePos.row][edgePos.col] = val },
                get() { return api.getCell(pos) }
            }
        }

        return {
            id: row + "," + col,
            data: {row, col},
            edges: {
                up: createEdge({row: row - 1, col: col}),
                down: createEdge({row: row + 1, col: col}),
                left: createEdge({row: row, col: col - 1}),
                right: createEdge({row: row, col: col + 1})
            }
        }
    }

    return api
}

maze.shuffle = (arr, rand) => {
    for (let i = 0; i !== arr.length; ++i) {
        const j = i + Math.floor(rand() * (arr.length - i))
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
    }
}

maze.depthFirstPrune = (seedCell, rand, doStuff = () => {}) => { // TODO: rand unused
    let visitedCells = {}

    const visit = (cell, enableEdgeToGetHere) => {
        if (visitedCells[cell.id]) {
            return
        }

        enableEdgeToGetHere()

        visitedCells[cell.id] = true
        let edges = []

        for (let direction in cell.edges) {
            const edge = cell.edges[direction]
            if (edge && !edge.getEnabled()) {
                edges.push(edge)
            }
        }

        shuffle(edges).forEach(edge => {
            visit(edge.get(), () => edge.setEnabled(true))
        })
    }

    visit(seedCell, () => {})
}

const fill = (len, val) => {
    let arr = new Array(len)

    for (let i = 0; i !== len; ++i) {
        arr[i] = val()
    }

    return arr
}

maze.generateBlank = ({rows, cols}) => {
    return maze.grid({
        horizontal: fill(rows + 1, () => fill(cols, () => false)),
        vertical: fill(rows, () => fill(cols + 1, () => false))
    })
}

maze.generate = ({rows, cols}) => {
    const result = maze.generateBlank({rows, cols})
    maze.depthFirstPrune(result.getCell({row: 0, col: 0}), Math.random)
    return result
}

maze.print = (grid) => {
    if (grid.size.rows === 0) {
        return
    }

    const printHorizontalRow = (row) => {
        let str = ""
        row.forEach(x => str += "." + (x ? " " : "_"))
        str += "."
        console.log(str)
    }

    const printVerticalRow = (row) => {
        let str = ""
        row.forEach(x => str += (x ? " " : "|") + " ")
        console.log(str)
    }

    printHorizontalRow(grid.edges.horizontal[0])

    for (let i = 0; i !== grid.size.rows; ++i) {
        printVerticalRow(grid.edges.vertical[i])
        printHorizontalRow(grid.edges.horizontal[i + 1])
    }
}
