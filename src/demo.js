'use strict'

import * as maze from './maze'

let createBlock = (x, y, w, h, cssClass) => {
    let el = document.createElement('div')
    
    el.style.position = 'absolute'

    el.style.left = x + 'px'
    el.style.top = y + 'px'
    el.style.width = w + 'px'
    el.style.height = h + 'px'

    el.setAttribute('class', cssClass)

    return el
}

let createMazeElement = (mz) => {
    let el = document.createElement('div')
    el.setAttribute('class', 'maze')

    let edgeRatio = 0.1

    let mzDisplayWidthUnits = mz.size.cols + edgeRatio * (mz.size.cols + 1)
    let mzDisplayHeightUnits = mz.size.rows + edgeRatio * (mz.size.rows + 1)

    let sizeMultiplier = 0.9 * Math.min(
        window.innerWidth / mzDisplayWidthUnits,
        window.innerHeight / mzDisplayHeightUnits
    )

    let xStart = 0.5 * (window.innerWidth - sizeMultiplier * mzDisplayWidthUnits)
    let yStart = 0.5 * (window.innerHeight - sizeMultiplier * mzDisplayHeightUnits)

    // corners
    for (let i = 0; i <= mz.size.rows; ++i) {
        for (let j = 0; j <= mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + j * sizeMultiplier * (1 + edgeRatio),
                yStart + i * sizeMultiplier * (1 + edgeRatio),
                sizeMultiplier * edgeRatio,
                sizeMultiplier * edgeRatio,
                'corner'
            ))
        }
    }

    // horizontal edges
    for (let i = 0; i <= mz.size.rows; ++i) {
        for (let j = 0; j < mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + sizeMultiplier * (edgeRatio + j * (1 + edgeRatio)),
                yStart + sizeMultiplier * i * (1 + edgeRatio),
                sizeMultiplier * 1,
                sizeMultiplier * edgeRatio,
                'wall' + (mz.edges.horizontal[i][j] ? '' : ' enabled')
            ))
        }
    }

    // vertical edges
    for (let i = 0; i < mz.size.rows; ++i) {
        for (let j = 0; j <= mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + sizeMultiplier * j * (1 + edgeRatio),
                yStart + sizeMultiplier * (edgeRatio + i * (1 + edgeRatio)),
                sizeMultiplier * edgeRatio,
                sizeMultiplier * 1,
                'wall' + (mz.edges.vertical[i][j] ? '' : ' enabled')
            ))
        }
    }

    // cells
    for (let i = 0; i < mz.size.rows; ++i) {
        for (let j = 0; j < mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + sizeMultiplier * (edgeRatio + j * (1 + edgeRatio)),
                yStart + sizeMultiplier * (edgeRatio + i * (1 + edgeRatio)),
                sizeMultiplier * 1,
                sizeMultiplier * 1,
                'cell'
            ))
        }
    }

    return el
}

window.addEventListener('load', () => {
    console.log('loaded')

    document.body.appendChild(
        createMazeElement(maze.generate({rows: 11, cols: 15}))
    )
})
