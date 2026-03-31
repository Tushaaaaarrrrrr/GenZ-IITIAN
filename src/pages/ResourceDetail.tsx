import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, ClipboardList, Wrench, Video, ExternalLink } from 'lucide-react';

interface Resource {
    id: number;
    level: string;
    subject: string;
    resource_type: string;
    sub_type: string;
    title: string;
    description: string;
    url: string;
}

const tabConfig = [
    { key: 'note', label: 'Study Notes', icon: FileText, color: '#10b981' },
    { key: 'pyq', label: 'PYQs', icon: ClipboardList, color: '#f59e0b' },
    { key: 'video', label: 'Videos', icon: Video, color: '#6366f1' },
    { key: 'tool', label: 'Tools', icon: Wrench, color: '#ec4899' },
];

export default function ResourceDetail() {
    const { level, subject } = useParams<{ level: string; subject: string }>();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('note');

    const decodedLevel = decodeURIComponent(level || '');
    const decodedSubject = decodeURIComponent(subject || '');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/resources?level=${encodeURIComponent(decodedLevel)}&subject=${encodeURIComponent(decodedSubject)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setResources(data);
                setLoading(false);
                // Auto-select first tab that has resources
                const types = new Set(data.map((r: Resource) => r.resource_type));
                if (types.size > 0) {
                    const first = tabConfig.find(t => types.has(t.key));
                    if (first) setActiveTab(first.key);
                }
            })
            .catch(() => setLoading(false));
    }, [decodedLevel, decodedSubject]);

    const currentTabResources = resources.filter(r => r.resource_type === activeTab);
    const currentTabConfig = tabConfig.find(t => t.key === activeTab)!;

    // For PYQs, group by sub_type
    const pyqGroups: Record<string, Resource[]> = {};
    if (activeTab === 'pyq') {
        currentTabResources.forEach(r => {
            const key = r.sub_type || 'General';
            if (!pyqGroups[key]) pyqGroups[key] = [];
            pyqGroups[key].push(r);
        });
    }

    // Count per tab
    const tabCounts = tabConfig.map(t => ({
        ...t,
        count: resources.filter(r => r.resource_type === t.key).length,
    }));

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold">Loading resources...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
            {/* Header */}
            <div className="bg-[#0b1120] text-white">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <Link
                        to="/resources"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Resources
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-[#10b981] text-white text-xs font-black rounded-full uppercase tracking-wider">
                            {decodedLevel}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black mb-3">{decodedSubject}</h1>
                    <p className="text-gray-400 font-medium">
                        {resources.length} resource{resources.length !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b-[3px] border-gray-100 bg-white sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                        {tabCounts.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 py-4 px-5 text-sm font-black whitespace-nowrap border-b-[3px] transition-all ${activeTab === tab.key
                                    ? `border-[${tab.color}] text-[#0b1120]`
                                    : 'border-transparent text-gray-400 hover:text-[#0b1120]'
                                    }`}
                                style={activeTab === tab.key ? { borderColor: tab.color } : {}}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full font-black"
                                        style={{
                                            background: activeTab === tab.key ? tab.color + '20' : '#f1f5f9',
                                            color: activeTab === tab.key ? tab.color : '#94a3b8',
                                        }}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-10">

                {currentTabResources.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-black text-[#0b1120] mb-2">No {currentTabConfig.label} Yet</h3>
                        <p className="text-gray-500 font-medium">
                            Resources for this section will be added soon. Check back later!
                        </p>
                    </div>
                ) : activeTab === 'pyq' ? (
                    /* PYQ view - grouped by sub_type */
                    <div className="space-y-10">
                        {Object.entries(pyqGroups).map(([groupName, items]) => (
                            <div key={groupName}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div
                                        className="w-1.5 h-8 rounded-full"
                                        style={{ background: currentTabConfig.color }}
                                    />
                                    <h2 className="text-xl font-black text-[#0b1120]">{groupName}</h2>
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                                        {items.length} paper{items.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {items.map((resource) => (
                                        <a
                                            key={resource.id}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-start gap-4 p-5 bg-white border-[3px] border-[#0b1120] rounded-2xl hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[8px_8px_0px_#0b1120] transition-all"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: currentTabConfig.color + '15' }}
                                            >
                                                <ClipboardList className="w-5 h-5" style={{ color: currentTabConfig.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-[#0b1120] mb-1 group-hover:text-[#10b981] transition-colors">
                                                    {resource.title}
                                                </h3>
                                                {resource.description && (
                                                    <p className="text-sm text-gray-500 font-medium">{resource.description}</p>
                                                )}
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#10b981] transition-colors shrink-0 mt-1" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Notes / Videos / Tools - flat list */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {currentTabResources.map((resource) => (
                            <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col p-6 bg-white border-[3px] border-[#0b1120] rounded-2xl hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0px_#0b1120] hover:shadow-[8px_8px_0px_#0b1120] transition-all"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: currentTabConfig.color + '15' }}
                                >
                                    <currentTabConfig.icon className="w-6 h-6" style={{ color: currentTabConfig.color }} />
                                </div>
                                <h3 className="font-black text-[#0b1120] text-lg mb-2 group-hover:text-[#10b981] transition-colors">
                                    {resource.title}
                                </h3>
                                {resource.description && (
                                    <p className="text-sm text-gray-500 font-medium mb-4 flex-1">{resource.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-bold mt-auto">
                                    Open Resource <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
