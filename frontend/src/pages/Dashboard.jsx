import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { PdfViewer } from '../components/PdfViewer';
import { SummaryCards } from '../components/SummaryCards';
import { ValidationTable } from '../components/ValidationTable';
import { MaterialValidationCard } from '../components/MaterialValidationCard';
import { PartValidationCard } from '../components/PartValidationCard';
import { uploadDrawing } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, 
  FileText, 
  AlertCircle, 
  HardHat,
  ScanSearch,
  ClipboardCheck
} from 'lucide-react';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationStatus, setValidationStatus] = useState('idle'); // idle, processing, completed
  
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setResults(null);
      setError(null);
      setValidationStatus('idle');
    }
  }, []);

  const handleValidate = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setValidationStatus('processing');

    try {
      const data = await uploadDrawing(file);
      setResults(data);
      setValidationStatus('completed');
    } catch (err) {
      const msg = err.message ?? 'Validation failed. Make sure the backend is running.';
      setError(msg);
      setValidationStatus('idle');
    } finally {
      setLoading(false);
    }
  }, [file]);

  return (
    <div className="flex h-screen overflow-hidden text-slate-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          projectName={file ? file.name : "Engineering Drawing Validator"}
          status={validationStatus}
          onUpload={() => fileInputRef.current?.click()}
          onRun={handleValidate}
          isLoading={loading}
          canRun={!!file && !loading}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileSelect(e.target.files?.[0])} 
            accept=".pdf" 
            className="hidden" 
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto text-center"
              >
                <div className="panel-industrial w-full max-w-4xl p-8 md:p-12 border border-slate-200/80 relative overflow-hidden">
                  <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-blue-200/35 blur-3xl" />
                  <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-slate-300/35 blur-3xl" />

                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-linear-to-br from-primary to-slate-700 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-slate-800/20 border border-slate-500/50 mx-auto">
                      <CloudUpload className="w-10 h-10 text-slate-100" />
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                      Mechanical Drawing Intelligence
                    </h2>
                    <p className="text-base md:text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                      Upload engineering drawing PDFs and instantly verify BOM callouts,
                      part references, and material compliance with production-grade confidence.
                    </p>

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-xl mx-auto p-8 border-2 border-dashed border-slate-400/60 rounded-3xl bg-white/80 hover:border-primary hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <FileText className="w-6 h-6 text-slate-500 group-hover:text-primary" />
                        </div>
                        <p className="font-bold text-slate-800">Click to upload or drag and drop</p>
                        <p className="text-sm text-slate-500">PDF engineering drawings only</p>
                      </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      <FeatureCard icon={ScanSearch} title="Callout Detection" subtitle="Cross-check drawing callouts against BOM lines." />
                      <FeatureCard icon={ClipboardCheck} title="Validation Report" subtitle="Get pass/fail traceability by item." />
                      <FeatureCard icon={HardHat} title="Material Compliance" subtitle="Confirm materials and finishes match standards." />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-full min-h-190"
              >
                {/* Error Toast if any */}
                {error && (
                  <div className="lg:col-span-12 bg-red-50/95 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}

                {/* Left: PDF Viewer (60%) */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-150">
                  <PdfViewer file={file} />
                </div>

                {/* Right: Summary & Results (40%) */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                  <SummaryCards summary={results?.summary} loading={loading} />
                  
                  <div className="flex-1 grid grid-cols-1 gap-6 overflow-hidden">
                    <ValidationTable 
                      items={results?.callout_validation ?? results?.items} 
                      loading={loading} 
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                      <MaterialValidationCard 
                        materialValidation={results?.material_validation} 
                        loading={loading} 
                      />
                      <PartValidationCard 
                        partValidation={results?.part_validation} 
                        loading={loading} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg bg-primary text-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default Dashboard;
