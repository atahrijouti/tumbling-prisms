import { Group, PerspectiveCamera, Scene, Vector3 } from "three"
import { CARPET_LENGTH, HEIGHT, MAX_PRISM_COUNT, WIDTH } from "./config.ts"
import { Treadmill } from "./treadmill.ts"

export class TreadmillScene extends Scene {
  treadmills: Treadmill[]
  treadmillsContainer: Group
  camera: PerspectiveCamera
  progress = 0
  constructor() {
    super()

    this.treadmillsContainer = new Group()
    this.add(this.treadmillsContainer)

    this.treadmills = Array.from({ length: MAX_PRISM_COUNT }, (_, i) => {
      return new Treadmill(i + 2)
    })

    this.treadmills.forEach((treadmill) =>
      this.treadmillsContainer.add(treadmill.translationAnchor),
    )

    this.camera = new PerspectiveCamera(25, WIDTH / HEIGHT, 0.01, 2000)
  }

  centerPosition = () => {
    const middleTreadmill = this.treadmills[(this.treadmills.length / 2) | 0]
    return new Vector3(-CARPET_LENGTH / 2, 0, middleTreadmill.translationAnchor.position.z)
  }

  update = (progress: number) => {
    this.progress = progress
    this.treadmills.forEach((treadmill) => treadmill.setProgress(progress))
  }

  reset = () => {
    this.progress = 0
    this.treadmills.forEach((treadmill) => treadmill.setProgress(0))
  }
}
