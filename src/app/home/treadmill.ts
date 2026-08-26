import {
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MathUtils,
} from "three"
import { LineMaterial } from "three/addons/lines/LineMaterial.js"
import { LineSegments2 } from "three/addons/lines/LineSegments2.js"
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js"
import {
  CARPET_LENGTH,
  PRISM_SCALE,
  HEIGHT,
  LINE_COLOR,
  OPAQUE_COLOR,
  OPAQUE_SHAPE_DOWN_SCALE,
  WIDTH,
} from "./config.ts"

const { degToRad } = MathUtils

export const createPrism = (segments: number) => {
  const radius = 0.5 / Math.sin(Math.PI / segments)

  // Outer : Glowing lines
  const cylinderGeometry = new CylinderGeometry(radius, radius, PRISM_SCALE, segments)
  const edges = new EdgesGeometry(cylinderGeometry)
  const lineMaterial = new LineMaterial({
    color: LINE_COLOR,
    linewidth: 2,
    side: DoubleSide,
  })
  lineMaterial.resolution.set(WIDTH, HEIGHT)

  // Inner : Opaque inside shape
  const opaqueMaterial = new MeshBasicMaterial({ color: OPAQUE_COLOR })
  const opaqueInner = new Mesh(cylinderGeometry.clone(), opaqueMaterial)
  opaqueInner.scale.set(OPAQUE_SHAPE_DOWN_SCALE, OPAQUE_SHAPE_DOWN_SCALE, OPAQUE_SHAPE_DOWN_SCALE)

  const lineGeometry = new LineSegmentsGeometry()
  const mesh = new LineSegments2(lineGeometry.fromEdgesGeometry(edges), lineMaterial)
  mesh.position.set(0, radius, 0)
  mesh.rotation.set(degToRad(90), degToRad(0), degToRad(0))
  mesh.add(opaqueInner)

  return mesh
}

export const createCarpet = () => {
  const group = new Group()
  const carpet = createPrism(2)

  carpet.rotation.set(degToRad(90), degToRad(90), 0)
  carpet.position.set(-0.5, 0, 0)

  Array.from({ length: CARPET_LENGTH }, (_, i) => {
    const piece = carpet.clone()
    piece.position.set(-0.5 - i, 0, 0)
    group.add(piece)
  })

  return group
}

export class Treadmill {
  segments: number
  rotationAnchor: Group
  mirrorAnchor: Group
  translationAnchor: Group
  maxAngleRad: number

  constructor(segments: number) {
    // span the star of the show
    this.segments = segments
    const prismMesh = createPrism(segments)

    // put prism on its flat side
    const redressAnchor = new Group()
    const angleSum = (segments - 2) * 180
    const redressAngle = 90 - angleSum / segments / 2

    this.maxAngleRad = degToRad(180 - angleSum / this.segments)

    redressAnchor.rotation.z += degToRad(-redressAngle)
    redressAnchor.add(prismMesh)

    // spread the prisms along the X axis
    const adjustXAnchor = new Group()
    adjustXAnchor.position.x = -1
    adjustXAnchor.add(redressAnchor)

    this.rotationAnchor = new Group()
    this.rotationAnchor.add(adjustXAnchor)

    // spawn the mirror image of the prism
    this.mirrorAnchor = this.rotationAnchor.clone()

    // turn it upside down and push it the opposite way
    this.mirrorAnchor.position.x = -CARPET_LENGTH
    this.mirrorAnchor.scale.y = -1

    // the prisms should appear to be continually tumbling
    this.translationAnchor = new Group()
    this.translationAnchor.add(this.rotationAnchor)
    this.translationAnchor.add(this.mirrorAnchor)
    this.translationAnchor.position.z = (segments - 2) * (0.5 + 1 - OPAQUE_SHAPE_DOWN_SCALE)

    const carpet = createCarpet()
    this.translationAnchor.add(carpet)
  }

  setProgress = (progress: number) => {
    const angle = -this.maxAngleRad * progress

    this.rotationAnchor.rotation.z = angle
    this.mirrorAnchor.rotation.z = -angle
    this.translationAnchor.position.x = -progress
  }
}
