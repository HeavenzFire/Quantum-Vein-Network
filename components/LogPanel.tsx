
import React from 'react';
import { LogEntry, LogType } from '../types';

interface LogPanelProps {
    logs: LogEntry[];
}

const LogTypeIndicator: React.FC<{ type: LogType }> = ({ type }) => {
    const typeStyles: { [key in LogType]: { color: string; label: string } } = {
        [LogType.Info]: { color: 'bg-blue-500', label: 'INF' },
        [LogType.Success]: { color: 'bg-green-500', label: 'OK' },
        [LogType.Warning]: { color: 'bg-yellow-500', label: 'WARN' },
        [LogType.Error]: { color: 'bg-red-500', label: 'ERR' },
        [LogType.System]: { color: 'bg-cyan-500', label: 'SYS' }
    };

    const { color, label } = typeStyles[type];
    
    return (
      <span className={`px-2 py-0.5 text-xs font-bold text-gray-900 rounded-sm ${color}`}>
        {label}
      </span>
    );
};

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
    return (
        <div className="panel-bg rounded-lg p-2 flex-grow w-full md:w-auto md:max-w-2xl h-48 md:h-64 flex flex-col">
            <h3 className="text-lg font-bold text-cyan-300 glow-text mb-2 px-2">Integrity Log</h3>
            <div className="flex-grow overflow-y-auto pr-2 log-entry">
                {logs.map((log, index) => (
                    <div key={index} className="flex items-start text-sm mb-2 last:mb-0">
                        <div className="flex-shrink-0 w-12">
                            <LogTypeIndicator type={log.type} />
                        </div>
                        <div className="flex-grow">
                             <p className="font-mono text-gray-300">
                                <span className="text-gray-500 mr-2">{log.timestamp.toLocaleTimeString()}</span>
                                {log.message}
                            </p>
                            {log.hash && (
                                <p className="text-xs text-cyan-400 opacity-60 ml-2">HASH: {log.hash}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
