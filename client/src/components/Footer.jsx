/**
 * client/src/components/Footer.jsx
 *
 * Global footer displaying demo data disclaimer and research context.
 */

import React from 'react';
import { DEMO_DATA_NOTICE } from '../config.js';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-center md:text-left leading-relaxed max-w-2xl text-slate-400">
          <span className="font-semibold text-amber-400">⚠️ Research Demo Notice: </span>
          {DEMO_DATA_NOTICE}
        </p>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Travel QA Research Platform</span>
          <span>•</span>
          <span>V1 vs. V2 Evaluation Engine</span>
        </div>
      </div>
    </footer>
  );
}
