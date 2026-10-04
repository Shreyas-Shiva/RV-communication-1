import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Download, Languages, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { COMMUNICATION_ASSETS, CommunicationAsset } from '../data/assets';

interface ReviewPageProps {
  onBack: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<'all' | 'unreviewed' | 'reviewed'>('all');
  const [search, setSearch] = useState<string>('');
  const [assets, setAssets] = useState<CommunicationAsset[]>(COMMUNICATION_ASSETS);

  const reviewedCount = assets.filter(a => a.reviewed).length;
  const unreviewedCount = assets.length - reviewedCount;
  const reviewedPercent = Math.round((reviewedCount / assets.length) * 100);

  const filteredAssets = assets.filter(a => {
    if (filter === 'unreviewed' && a.reviewed) return false;
    if (filter === 'reviewed' && !a.reviewed) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.labels.en.toLowerCase().includes(q) ||
        a.labels.kn.toLowerCase().includes(q) ||
        a.labels.hi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleReviewed = (id: string) => {
    setAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, reviewed: !a.reviewed } : a))
    );
  };

  const handleExportCsv = () => {
    const rows = [
      'id,category,english,kannada,hindi,reviewed'
    ];
    for (const a of assets) {
      rows.push(`"${a.id}","${a.categoryId}","${a.labels.en}","${a.labels.kn}","${a.labels.hi}","${a.reviewed ? 'yes' : 'no'}"`);
    }
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `communiq-translations-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="max-w-5xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <Languages className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              Translation Review Kit
            </h1>
            <p className="text-sm font-semibold text-[#0A6C6E]">
              Native Speaker Verification and Quality Dashboard
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 text-center">
          <span className="text-xs font-bold text-[#5E564D] uppercase block">Total Strings</span>
          <span className="text-3xl font-black text-[#1F1B16] mt-1">{assets.length}</span>
        </div>

        <div className="bg-[#EBF7EF] border-2 border-[#1B7A42] rounded-[12px] p-4 text-center">
          <span className="text-xs font-bold text-[#1B7A42] uppercase block">Reviewed (Verified)</span>
          <span className="text-3xl font-black text-[#1B7A42] mt-1">{reviewedCount} ({reviewedPercent}%)</span>
        </div>

        <div className="bg-[#FFF4D6] border-2 border-[#FFB703] rounded-[12px] p-4 text-center">
          <span className="text-xs font-bold text-[#7A5400] uppercase block">Pending Human Review</span>
          <span className="text-3xl font-black text-[#7A5400] mt-1">{unreviewedCount}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-colors ${
              filter === 'all' ? 'bg-[#0A6C6E] text-white border-[#0A6C6E]' : 'bg-[#FFF8EF] text-[#5E564D] border-[#E5DACF]'
            }`}
          >
            All ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unreviewed')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-colors ${
              filter === 'unreviewed' ? 'bg-[#0A6C6E] text-white border-[#0A6C6E]' : 'bg-[#FFF8EF] text-[#5E564D] border-[#E5DACF]'
            }`}
          >
            Pending Review ({unreviewedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('reviewed')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-colors ${
              filter === 'reviewed' ? 'bg-[#0A6C6E] text-white border-[#0A6C6E]' : 'bg-[#FFF8EF] text-[#5E564D] border-[#E5DACF]'
            }`}
          >
            Reviewed ({reviewedCount})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E564D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phrases..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FFF8EF] border border-[#E5DACF] rounded-[8px] text-xs font-bold"
            />
          </div>

          <Button
            variant="secondary"
            size="normal"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4 text-[#0A6C6E]" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table of Strings */}
      <div className="border-2 border-[#E5DACF] rounded-[12px] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FFF8EF] border-b-2 border-[#E5DACF] font-black text-[#1F1B16]">
            <tr>
              <th className="p-3">ID / Concept</th>
              <th className="p-3">English</th>
              <th className="p-3">Kannada (ಕನ್ನಡ)</th>
              <th className="p-3">Hindi (हिन्दी)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DACF]">
            {filteredAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-[#FFF8EF]/50 transition-colors">
                <td className="p-3 font-mono font-bold text-[#5E564D]">{asset.id}</td>
                <td className="p-3 font-bold text-[#1F1B16]">{asset.labels.en}</td>
                <td className="p-3 font-bold text-[#085557] text-sm">{asset.labels.kn}</td>
                <td className="p-3 font-bold text-[#085557] text-sm">{asset.labels.hi}</td>
                <td className="p-3 text-center">
                  {asset.reviewed ? (
                    <span className="inline-flex items-center gap-1 text-[#1B7A42] font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Reviewed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#FFB703] font-bold">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => toggleReviewed(asset.id)}
                    className="px-2.5 py-1 rounded-[6px] border border-[#E5DACF] bg-white text-[#1F1B16] hover:bg-[#FFF8EF] font-bold cursor-pointer"
                  >
                    {asset.reviewed ? 'Mark Pending' : 'Mark Reviewed'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
};
