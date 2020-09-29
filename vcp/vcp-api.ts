/**
 * @description Message API type
 */
export type APIType =
    "headPoseAPI" |
    "fullBodyAPI" |
    "controlAPI" |
    "interactionAPI" |
    "bustAPI" |
    "handshake";

/**
 * @description Client role used by HandshakeAPI
 */
export type ClientRole =
    "sink" |
    "source" |
    "undefined" |
    "control" |
    "all";

/**
 * @description Base interface for APIProcessor
 * @see APISink
 */
export interface APIProcessor {
    process(object: RawAPI): void
    getSupportedAPI(): APIType[]
}

/**
 * JSON から抽出したばかりの生のAPI
 * これにメソッド類をアタッチして完成
 */
export interface RawAPI {
    type: string
}

/**
 * @classdesc Base class of VCP APIs
 */
export abstract class APIBase {
    abstract type: APIType
    abstract getAPIType(): APIType
    sender?: string = undefined
}

/**
 * @description VCP Euler angle rotation interface
 */
export interface EulerRotation {
    pitch: number
    roll: number
    yaw: number
}

/**
 * @description VCP XYZ-coordinate spacial position interface
 */
export interface SpacialPosition {
    x: number
    y: number
    z: number
}

/**
 * @description VCP Quaternion rotation interface
 */
export interface VCPQuaternion {
    x : number
    y : number
    z : number
    w : number
}

/**
 * @description VCP FullBodyAPI FullBodyJoint element interface
 */
export interface Joint {
    rotation: VCPQuaternion
    position?: SpacialPosition
}

/**
 * @description VCP FullBodyAPI joint information structure interface
 */
export interface FullBodyJoint {
    [jointName: string] : Joint
}

/**
 * @classdesc VCP HeadPoseAPI class
 */
export class HeadPose implements APIBase {
    rotation: EulerRotation = { pitch: 0, roll: 0, yaw: 0 };
    position: SpacialPosition = { x: 0, y: 0, z: 0 };

    type = "headPoseAPI" as APIType;
    getAPIType = () => "headPoseAPI" as APIType;
}

/**
 * @classdesc VCP HandshakeAPI class
 */
export class Handshake implements APIBase {
    type = "handshake" as APIType;
    role: ClientRole;
    getAPIType = () => "handshake" as APIType;

    constructor(role: ClientRole) {
        this.role = role;
    }
}

/**
 * @classdesc VCP FullBodyAPI class
 */
export class FullBody implements APIBase {
    type: APIType = "fullBodyAPI";
    getAPIType = () => this.type;
    sender?: string | undefined;

    joints: FullBodyJoint = {};
    hipPosition: SpacialPosition = { x: 0, y: 0, z: 0 };
}

/**
 * @classdesc Default implementation of APIProcessor
 * Provides type-safety well-typed processor interface.
 */
export class APISink<T extends APIBase> implements APIProcessor {
    supportedAPI: APIType;

    /**
     * Create new instance for given class.
     * @param ctor API class constructor to process
     * @example new APISink(HeadPose);
     */
    constructor(private ctor: { new(): T }) {
        let api = new ctor();
        this.supportedAPI = api.getAPIType();
        console.log(this.supportedAPI);
    }

    /**
     * Custom method to process messages.
     * Override this method to process messages.
     * @param message API message
     */
    onMessage(message: T) { }

    /**
     * APIに適切なメソッドをくっつけて適切な型に変換する
     * @param object メソッドがついていないAPIデータ
     */
    process(object: RawAPI) {
        let api = new this.ctor();
        this.onMessage(Object.assign(api, object) as T);
    }

    getSupportedAPI() {
        return [this.supportedAPI];
    }
}
