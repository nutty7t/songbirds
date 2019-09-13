interface LineSegment {
  start: number
  end: number
}

function lerp (start: number, end: number, weight: number) {
  return (1 - weight) * start + weight * end
}

function subpathSDA (start: number, end: number, pathLength: number) {
  const subpathLength = (end - start) * pathLength
  const subpathOffset = start * pathLength
  return `0 ${subpathOffset} ${subpathLength} ${pathLength}`
}

function drawPathStep (start: number, element: HTMLElement, from: LineSegment, to: LineSegment, duration: number, resolve: Function) {
  const context = arguments

  // Compute the subpath at current frame.
  return function (timestamp: number) {
    const progress = timestamp - start
    const weight = progress / duration
    const subpathStart = lerp(from.start, to.start, weight)
    const subpathEnd = lerp(from.end, to.end, weight)
    const pathLength = (element as any).getTotalLength()

    // Update path for re-render.
    element.style.strokeDasharray = subpathSDA(
      subpathStart,
      subpathEnd,
      pathLength
    )

    if (progress < duration) {
      // Wait for the next frame.
      window.requestAnimationFrame((drawPathStep as Function)(...context))
    } else {
      // Animation completed.
      resolve()
    }
  }
}

export function drawPath (selector: string, from: LineSegment, to: LineSegment, duration = 1000) {
  const start = performance.now()
  const element = document.querySelector(selector)
  return new Promise((resolve, _) => {
    window.requestAnimationFrame(drawPathStep(
      start,
      element as HTMLElement,
      from,
      to,
      duration,
      resolve
    ))
  })
}
