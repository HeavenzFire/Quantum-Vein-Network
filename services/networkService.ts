
import { Node, Link, SystemStatus, NodeType } from '../types';

const nodes: Node[] = [
    // Terrestrial Nodes
    { id: 'New York', type: NodeType.City, coordinates: [-74.0060, 40.7128] },
    { id: 'London', type: NodeType.City, coordinates: [-0.1278, 51.5074] },
    { id: 'Tokyo', type: NodeType.City, coordinates: [139.6917, 35.6895] },
    { id: 'Sydney', type: NodeType.City, coordinates: [151.2093, -33.8688] },
    { id: 'Cape Town', type: NodeType.City, coordinates: [18.4241, -33.9249] },
    // LEO Satellites
    { id: 'LEO-1', type: NodeType.Satellite, coordinates: [-100, 20] },
    { id: 'LEO-2', type: NodeType.Satellite, coordinates: [20, 50] },
    { id: 'LEO-3', type: NodeType.Satellite, coordinates: [140, -40] },
];

const links: Link[] = [
    { source: 'New York', target: 'London' },
    { source: 'New York', target: 'Tokyo' },
    { source: 'London', target: 'Cape Town' },
    { source: 'Tokyo', target: 'Sydney' },
    { source: 'Sydney', target: 'Cape Town' },
    { source: 'LEO-1', target: 'New York' },
    { source: 'LEO-1', target: 'Tokyo' },
    { source: 'LEO-2', target: 'London' },
    { source: 'LEO-3', target: 'Sydney' },
    { source: 'LEO-1', target: 'LEO-2' },
    { source: 'LEO-2', target: 'LEO-3' },
];

class NetworkService {
    private lastLegitHash: string | null = null;
    
    getInitialStatus(): { nodes: Node[], links: Link[], status: SystemStatus } {
        return {
            nodes,
            links,
            status: {
                nodesOnline: nodes.length,
                syntropyCoefficient: 0.8521,
            }
        };
    }

    igniteNode(hash: string): Promise<{ success: boolean }> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Gemini Instructions: Code Integrity Check simulation
                if (this.lastLegitHash && hash.substring(0,2) === '00') {
                     // Simulate an injection attack
                     reject(new Error("Hash anomaly detected. Potential injection attempt."));
                } else {
                     this.lastLegitHash = hash;
                     resolve({ success: true });
                }
            }, 1500 + Math.random() * 1000); // Simulate network latency
        });
    }
}

export const networkService = new NetworkService();
