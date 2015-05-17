'use strict'

export default function(x, y) {
    let self = this

    self.x = x
    self.y = y

    self.element = document.createElement('div')
    self.element.setAttribute('class', 'mouse')
    self.element.style.position = 'relative'
    self.element.style.width = '48px'
    self.element.style.height = '48px'
    self.element.style.overflow = 'hidden'

    self.imgElement = document.createElement('img')
    self.imgElement.src = 'assets/mouse.png'
    self.imgElement.style.position = 'absolute'
    self.imgElement.style.left = '0px'
    self.imgElement.style.top = '0px'
    self.element.appendChild(self.imgElement)

    self.updatePosition = () => {
        self.element.style.left = self.x - 24 + 'px'
        self.element.style.top = self.y - 32 + 'px'
    }

    self.updatePosition()

    self.updateImageClip = () => {
        let left = 48 * self.clippingIndex

        let top = {
            'up': 48 * 3,
            'down': 48 * 0,
            'left': 48 * 1,
            'right': 48 * 2
        }[self.direction]

        self.imgElement.style.left = -left + 'px'
        self.imgElement.style.top = -top + 'px'
    }

    self.direction = 'down'
    self.clippingIndex = 0

    self.clippingStep = () => {
        self.clippingIndex++
        self.clippingIndex %= 4
        self.updateImageClip()
    }

    self.clippingInterval = setInterval(self.clippingStep, 250)

    self.changeDirection = (direction) => {
        self.direction = direction
        clearInterval(self.clippingInterval)
        self.updateImageClip()
        self.clippingInterval = setInterval(self.clippingStep, 250)
    }

    self.animationUpdate = () => {
        let dt = new Date() - self.animation.startTime

        if (dt >= self.animation.duration) {
            self.x = self.animation.endX
            self.y = self.animation.endY
            self.updatePosition()
            self.animation.resolve()
            self.animation = null
            return
        }

        let p = dt / self.animation.duration
        self.x = (1 - p) * self.animation.startX + p * self.animation.endX
        self.y = (1 - p) * self.animation.startY + p * self.animation.endY
        self.updatePosition()
        self.animation.requestId = window.requestAnimationFrame(self.animationUpdate)
    }

    self.animation = null

    self.move = (x, y, duration) => {
        return new Promise(function(resolve) {
            let dx = x - self.x
            let dy = y - self.y

            if (Math.abs(dx) > Math.abs(dy)) {
                self.changeDirection(dx > 0 ? 'right' : 'left')
            } else {
                self.changeDirection(dy > 0 ? 'down' : 'up')
            }

            if (self.animation) {
                window.cancelAnimationFrame(self.animation.requestId)
                self.animation.resolve()
            }

            self.animation = {
                startTime: new Date(),
                duration,
                startX: self.x,
                startY: self.y,
                endX: x,
                endY: y,
                requestId: window.requestAnimationFrame(self.animationUpdate),
                resolve
            }
        })
    }
}
