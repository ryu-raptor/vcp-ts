/**
 * Extension functions for THREE.js
 */

import * as THREE from 'three'
import { SpacialPosition, EulerRotation, VCPQuaternion } from "./vcp-api";
import { Quaternion, Euler } from 'three';

/**
 * Convert SpacialPosition to THREE.Vector3
 * @param sp SpacialPosition
 */
export function toThreeVector3(sp: SpacialPosition)
{
    return new THREE.Vector3(sp.x, sp.y, sp.z);
}

/**
 * Convert EularRotation to THREE.Quaternion
 * @param rot EularRotation
 */
export function toQuaternion(rot: EulerRotation)
{
    return new Quaternion().setFromEuler(new Euler(rot.pitch, rot.yaw, rot.roll));
}

/**
 * Convert VCPQuaternion to THREE.Quaternion
 * @param rot VCPQuaternion
 */
export function toThreeQuaternion(q: VCPQuaternion)
{
    return new Quaternion(q.x, q.y, q.z, q.w);
}
