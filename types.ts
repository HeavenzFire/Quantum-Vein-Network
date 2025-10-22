
export enum NodeType {
    City,
    Satellite,
}

export interface Node {
    id: string;
    type: NodeType;
    coordinates: [number, number]; // [longitude, latitude]
}

export interface Link {
    source: string;
    target: string;
}

export interface SystemStatus {
    nodesOnline: number;
    syntropyCoefficient: number;
}

export enum LogType {
    Info = 'INFO',
    Success = 'SUCCESS',
    Warning = 'WARNING',
    Error = 'ERROR',
    System = 'SYSTEM'
}

export interface LogEntry {
    timestamp: Date;
    message: string;
    type: LogType;
    hash?: string;
}

export enum Modulation {
    Syntropy = 'syntropy',
    Convergence = 'convergence',
    Emergence = 'emergence'
}
