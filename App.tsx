
import React, { useState, useEffect, useCallback } from 'react';
import { sha256 } from 'js-sha256';

import { GlobeVisualization } from './components/GlobeVisualization';
import { ControlPanel } from './components/ControlPanel';
import { LogPanel } from './components/LogPanel';
import { networkService } from './services/networkService';
import { Node, Link, SystemStatus, LogEntry, LogType, Modulation } from './types';

const App: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({ nodesOnline: 0, syntropyCoefficient: 0 });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const addLog = useCallback((message: string, type: LogType, hash?: string) => {
        setLogs(prev => [{ timestamp: new Date(), message, type, hash }, ...prev].slice(0, 100));
    }, []);

    const initializeNetwork = useCallback(() => {
        addLog("Initializing Quantum Vein Network...", LogType.Info);
        const { nodes: initialNodes, links: initialLinks, status: initialStatus } = networkService.getInitialStatus();
        setNodes(initialNodes);
        setLinks(initialLinks);
        setSystemStatus(initialStatus);
        addLog("Network Online. 5 terrestrial nodes, 3 LEO satellites active.", LogType.Success);
        addLog("Gemini Instructions Active: Codebase integrity monitoring enabled.", LogType.System);
        setIsInitialized(true);
    }, [addLog]);

    useEffect(() => {
        initializeNetwork();
        
        const statusInterval = setInterval(() => {
            setSystemStatus(prevStatus => {
                const change = (Math.random() - 0.5) * 0.02;
                const newCoefficient = Math.max(0.7, Math.min(0.98, prevStatus.syntropyCoefficient + change));
                return { ...prevStatus, syntropyCoefficient: newCoefficient };
            });
        }, 5000);

        return () => clearInterval(statusInterval);
    }, [initializeNetwork]);


    const handleIgniteNode = useCallback(async (vortexScale: number, modulation: Modulation) => {
        const payload = { scale: vortexScale, mod: modulation, time: Date.now(), seed: 'D9111' };
        const hash = sha256(JSON.stringify(payload));
        
        addLog(`Ignition sequence started for Phoenix Node. Modulation: ${modulation}.`, LogType.Info, hash.slice(0, 16));

        try {
            await networkService.igniteNode(hash);
            addLog("Code integrity check passed. SHA-256 validation successful.", LogType.Success, hash.slice(0, 16));
            addLog("Phoenix Node ignited. Syntropy pulse emitted through network.", LogType.System, hash.slice(0, 16));
             setSystemStatus(prev => ({ ...prev, syntropyCoefficient: Math.min(0.99, prev.syntropyCoefficient + 0.05) }));
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
            addLog(`TAMPERING DETECTED: ${errorMessage}`, LogType.Error, hash.slice(0, 16));
            addLog("Self-healing protocol initiated. Reverting to secure state.", LogType.Warning);
        }
    }, [addLog]);

    return (
        <div className="relative w-screen h-screen font-mono bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2a]">
            <GlobeVisualization nodes={nodes} links={links} isInitialized={isInitialized} />
            <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-10">
                <h1 className="text-2xl md:text-4xl font-bold text-cyan-300 glow-text tracking-widest uppercase">
                    Quantum Vein Network
                </h1>
                <p className="text-cyan-400 opacity-80">ECF Safeguard Protocol: Active</p>
            </header>

            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 z-10 flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-end">
                <LogPanel logs={logs} />
                <ControlPanel
                    systemStatus={systemStatus}
                    onIgniteNode={handleIgniteNode}
                />
            </div>
        </div>
    );
};

export default App;
