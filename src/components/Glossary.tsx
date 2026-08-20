/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GLOSSARY_ENTRIES } from '../data/modules';
import { Search, BookOpen, Filter, Hash } from 'lucide-react';

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  const categories = ['Tous', 'Neurobiologie', 'Échelles', 'Protocoles', 'Techniques'];

  const filteredEntries = GLOSSARY_ENTRIES.filter(entry => {
    const matchesSearch = entry.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#161618] border border-slate-800/50 rounded-xl overflow-hidden shadow-sm" id="glossary-panel">
      {/* Search and Filters Header */}
      <div className="p-5 border-b border-slate-800/60 bg-[#111113] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <BookOpen className="text-blue-500" size={20} />
              Glossaire Clinique TAI & EMDR
            </h3>
            <p className="text-xs text-slate-400">Dictionnaire interactif des échelles, concepts neurologiques et techniques</p>
          </div>
          {/* Quick Stats */}
          <span className="text-xs font-medium text-slate-500 self-start md:self-auto">
            {filteredEntries.length} terme{filteredEntries.length > 1 ? 's' : ''} trouvé{filteredEntries.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Rechercher un terme, un acronyme, un mot clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-4 min-h-[44px] bg-slate-950/60 border border-slate-800 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-white placeholder-slate-650"
              id="input-glossary-search"
            />
          </div>

          {/* Category Filter list */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center ${
                  selectedCategory === cat
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold shadow-sm'
                    : 'border-slate-800 bg-[#111113] text-slate-400 hover:bg-slate-800/50'
                }`}
                id={`btn-filter-cat-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Dictionary Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto bg-[#161618]">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl border border-slate-850 hover:border-slate-800 bg-[#161618] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              id={`glossary-entry-${index}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-white text-sm leading-snug font-sans">
                    {entry.term}
                  </h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border shrink-0 ${
                    entry.category === 'Neurobiologie' ? 'bg-indigo-950/40 text-indigo-300 border-indigo-900/30' :
                    entry.category === 'Échelles' ? 'bg-amber-950/40 text-amber-300 border-amber-900/30' :
                    entry.category === 'Protocoles' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/30' :
                    'bg-purple-950/40 text-purple-300 border-purple-900/30'
                  }`}>
                    {entry.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {entry.definition}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500 italic">
            Aucun terme ne correspond à vos critères de recherche.
          </div>
        )}
      </div>
    </div>
  );
}
