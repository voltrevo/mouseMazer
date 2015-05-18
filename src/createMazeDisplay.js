'use strict'

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

export default (mz) => {
    let el = document.createElement('div')
    el.setAttribute('class', 'maze')

    let edgeUnits = 0.1

    let mzDisplayWidthUnits = mz.size.cols + edgeUnits * (mz.size.cols + 1)
    let mzDisplayHeightUnits = mz.size.rows + edgeUnits * (mz.size.rows + 1)

    let unitSize = 0.9 * Math.min(
        window.innerWidth / mzDisplayWidthUnits,
        window.innerHeight / mzDisplayHeightUnits
    )

    let xStart = 0.5 * (window.innerWidth - unitSize * mzDisplayWidthUnits)
    let yStart = 0.5 * (window.innerHeight - unitSize * mzDisplayHeightUnits)

    // corners
    for (let i = 0; i <= mz.size.rows; ++i) {
        for (let j = 0; j <= mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + j * unitSize * (1 + edgeUnits),
                yStart + i * unitSize * (1 + edgeUnits),
                unitSize * edgeUnits,
                unitSize * edgeUnits,
                'corner'
            ))
        }
    }

    // horizontal edges
    for (let i = 0; i <= mz.size.rows; ++i) {
        for (let j = 0; j < mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + unitSize * (edgeUnits + j * (1 + edgeUnits)),
                yStart + unitSize * i * (1 + edgeUnits),
                unitSize * 1,
                unitSize * edgeUnits,
                'wall' + (mz.edges.horizontal[i][j] ? '' : ' enabled')
            ))
        }
    }

    // vertical edges
    for (let i = 0; i < mz.size.rows; ++i) {
        for (let j = 0; j <= mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + unitSize * j * (1 + edgeUnits),
                yStart + unitSize * (edgeUnits + i * (1 + edgeUnits)),
                unitSize * edgeUnits,
                unitSize * 1,
                'wall' + (mz.edges.vertical[i][j] ? '' : ' enabled')
            ))
        }
    }

    // cells
    for (let i = 0; i < mz.size.rows; ++i) {
        for (let j = 0; j < mz.size.cols; ++j) {
            el.appendChild(createBlock(
                xStart + unitSize * (edgeUnits + j * (1 + edgeUnits)),
                yStart + unitSize * (edgeUnits + i * (1 + edgeUnits)),
                unitSize * 1,
                unitSize * 1,
                'cell'
            ))
        }
    }

    return {
        element: el,
        getPos(i, j) {
            return {
                x: xStart + unitSize * (edgeUnits + 0.5 + j * (1 + edgeUnits)),
                y: yStart + unitSize * (edgeUnits + 0.5 + i * (1 + edgeUnits)),
            }
        }
    }
}
