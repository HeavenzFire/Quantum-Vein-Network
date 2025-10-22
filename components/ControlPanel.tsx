
import React, { useState } from 'react';
import { SystemStatus, Modulation } from '../types';

interface ControlPanelProps {
    systemStatus: SystemStatus;
    onIgniteNode: (vortexScale: number, modulation: Modulation) => void;
}

const StatDisplay: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div>
        <p className="text-xs text-cyan-400 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ systemStatus, onIgniteNode }) => {
    const [vortexScale, setVortexScale] = useState(1);
    const [modulation, setModulation] = useState<Modulation>(Modulation.Syntropy);
    const [lastHash, setLastHash] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleIgnite = async () => {
        setIsLoading(true);
        const payload = { scale: vortexScale, mod: modulation, time: Date.now(), seed: 'D9111' };
        // We use js-sha256 in the parent App, but this simulates the client-side hash display
        const clientHash = (await import('js-sha256')).sha256(JSON.stringify(payload)).slice(0, 16);
        setLastHash(clientHash);
        
        await onIgniteNode(vortexScale, modulation);
        setIsLoading(false);
    };

    return (
        <div className="panel-bg p-4 rounded-lg border border-cyan-700/50 shadow-2xl shadow-cyan-500/10 w-full md:w-auto md:max-w-sm">
            <h2 className="text-xl font-bold text-cyan-300 glow-text mb-3 border-b border-cyan-700/50 pb-2">SEQA-Dark Control</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <StatDisplay label="Nodes Online" value={systemStatus.nodesOnline.toString()} color="text-green-400" />
                <StatDisplay label="Syntropy Coeff." value={systemStatus.syntropyCoefficient.toFixed(4)} color="text-green-400" />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-1">Modulation</label>
                    <select
                        value={modulation}
                        onChange={(e) => setModulation(e.target.value as Modulation)}
                        className="w-full bg-cyan-900/50 border border-cyan-700 text-white rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value={Modulation.Syntropy}>Syntropy</option>
                        <option value={Modulation.Convergence}>Convergence</option>
                        <option value={Modulation.Emergence}>Emergence</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-1">Vortex Scale ({vortexScale})</label>
                    <input
                        type="range"
                        value={vortexScale}
                        onChange={(e) => setVortexScale(Number(e.target.value))}
                        min="1" max="10" step="1"
                        className="w-full h-2 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
                
                <button 
                    onClick={handleIgnite}
                    disabled={isLoading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-gray-900 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? 'Igniting...' : 'Ignite Phoenix Node'}
                </button>
            </div>
            
            <div className="mt-4 pt-3 border-t border-cyan-700/50">
                <p className="text-xs text-cyan-400">Last Integrity Hash:</p>
                <p className="text-sm text-white break-all">{lastHash || 'Awaiting ignition...'}</p>
            </div>
        </div>
    );
};
