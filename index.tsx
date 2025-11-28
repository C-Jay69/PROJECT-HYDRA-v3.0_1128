import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown,
  Activity,
  Cpu
} from 'lucide-react';

// --- Types ---
interface RedFlag {
  id?: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  quote: string;
  score: number;
  recommendation: string;
}

interface AnalysisResult {
  overall_risk_score: number;
  flags: RedFlag[];
  extracted_clauses: Record<string, string[]>;
}

// --- Styles Helper ---
const colors = {
  primary: '#0000FF',
  warning: '#FFBF00',
  success: '#BEF754',
  danger: '#FF00FF',
  info: '#00FFFF',
  bg: '#DCDFD5',
  text: '#000000',
  white: '#FFFFFF',
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: '20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
    color: colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: '-1px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  card: {
    background: colors.white,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '20px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  button: {
    background: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  badge: (severity: string) => {
    let bg = colors.success;
    let color = colors.text;
    
    switch(severity) {
      case 'CRITICAL': bg = colors.danger; color = colors.white; break;
      case 'HIGH': bg = colors.warning; break;
      case 'MEDIUM': bg = colors.info; break;
      case 'LOW': bg = colors.success; break;
    }
    
    return {
      background: bg,
      color: color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
    };
  }
};

// --- Components ---

const FlagCard: React.FC<{ flag: RedFlag }> = ({ flag }) => {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);

  const handleFeedback = async (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
    if (flag.id) {
      try {
        await fetch(`http://localhost:8000/flag/${flag.id}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_helpful: type === 'helpful',
            comments: 'User feedback from GUI'
          })
        });
      } catch (e) {
        console.error("Failed to send feedback", e);
      }
    }
  };

  return (
    <div style={{...styles.card, borderLeft: `6px solid ${flag.severity === 'CRITICAL' ? colors.danger : flag.severity === 'HIGH' ? colors.warning : colors.primary}`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
            <span style={styles.badge(flag.severity)}>{flag.severity}</span>
            <span style={{fontSize: '0.8rem', color: '#666', textTransform: 'uppercase'}}>{flag.category}</span>
          </div>
          <h3 style={{margin: '0 0 8px 0', fontSize: '1.2rem'}}>{flag.title}</h3>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: colors.primary}}>{flag.score}/10</div>
          <div style={{fontSize: '0.7rem', color: '#888'}}>RISK SCORE</div>
        </div>
      </div>

      <p style={{lineHeight: '1.6', color: '#444'}}>{flag.description}</p>

      {expanded && (
        <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
          <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: `3px solid ${colors.info}`, marginBottom: '15px'}}>
            <strong style={{display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: colors.primary}}>EXTRACTED TEXT</strong>
            <em style={{color: '#555'}}>"{flag.quote}"</em>
          </div>
          
          <div style={{marginBottom: '15px'}}>
            <strong style={{color: colors.primary}}>Recommendation:</strong>
            <p style={{margin: '5px 0'}}>{flag.recommendation}</p>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
            <button 
              onClick={() => handleFeedback('helpful')}
              style={{
                background: feedback === 'helpful' ? colors.success : 'transparent',
                border: `1px solid ${colors.success}`,
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ThumbsUp size={14} /> Helpful
            </button>
            <button 
              onClick={() => handleFeedback('unhelpful')}
              style={{
                background: feedback === 'unhelpful' ? colors.danger : 'transparent',
                color: feedback === 'unhelpful' ? 'white' : 'inherit',
                border: `1px solid ${colors.danger}`,
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ThumbsDown size={14} /> Not Helpful
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none', 
          border: 'none', 
          color: colors.primary, 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          marginTop: '10px',
          padding: 0,
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}
      >
        {expanded ? <>Show Less <ChevronUp size={16} /></> : <>View Details & Evidence <ChevronDown size={16} /></>}
      </button>
    </div>
  );
};

const Gauge = ({ score }: { score: number }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  let color = colors.success;
  if (score > 4) color = colors.warning;
  if (score > 7) color = colors.danger;

  return (
    <div style={{position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg height="120" width="120" style={{transform: 'rotate(-90deg)'}}>
        <circle
          stroke="#e6e6e6"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
      </svg>
      <div style={{position: 'absolute', textAlign: 'center'}}>
        <span style={{fontSize: '2rem', fontWeight: 'bold', color: color}}>{score}</span>
        <span style={{display: 'block', fontSize: '0.6rem', color: '#888'}}>RISK LEVEL</span>
      </div>
    </div>
  );
};

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useClaude, setUseClaude] = useState(true);
  const [useGpt, setUseGpt] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('use_claude', String(useClaude));
    formData.append('use_gpt', String(useGpt));

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please check the backend connection.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.title}>
          <ShieldAlert size={32} />
          <span>M&A Due Diligence AI</span>
        </div>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
           <div style={{fontSize: '0.9rem', color: '#666'}}>Powered by Hybrid LLM + Rules Engine</div>
        </div>
      </header>

      {!result && !loading && (
        <div style={{...styles.card, textAlign: 'center', padding: '60px 20px', border: `2px dashed ${colors.primary}`, background: '#f8f9ff'}}>
          <Upload size={64} color={colors.primary} style={{marginBottom: '20px'}} />
          <h2 style={{marginTop: 0, marginBottom: '10px'}}>Upload Contract PDF</h2>
          <p style={{color: '#666', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px'}}>
            Upload a legal agreement (PDF) to identify risks, missing clauses, and red flags using our hybrid AI engine.
          </p>
          
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            ref={fileInputRef}
            style={{display: 'none'}} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{...styles.button, margin: '0 auto', fontSize: '1.1rem'}}
          >
            Select PDF File
          </button>

          {file && (
            <div style={{marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: colors.primary, fontWeight: 'bold'}}>
              <FileText size={20} /> {file.name}
            </div>
          )}

          <div style={{marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input type="checkbox" checked={useClaude} onChange={e => setUseClaude(e.target.checked)} />
              Use Claude 3.5 Sonnet
            </label>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
              <input type="checkbox" checked={useGpt} onChange={e => setUseGpt(e.target.checked)} />
              Use GPT-4o
            </label>
          </div>

          {file && (
            <button 
              onClick={handleAnalyze}
              style={{
                ...styles.button, 
                background: colors.success, 
                color: colors.text, 
                margin: '30px auto 0',
                fontSize: '1.2rem',
                padding: '16px 48px'
              }}
            >
              <Activity size={24} /> Run Analysis
            </button>
          )}

          {error && (
             <div style={{marginTop: '20px', color: 'white', background: colors.danger, padding: '10px', borderRadius: '4px'}}>
               {error}
             </div>
          )}
        </div>
      )}

      {loading && (
        <div style={{textAlign: 'center', padding: '100px 0'}}>
          <div className="spinner" style={{
            width: '50px', 
            height: '50px', 
            border: `5px solid ${colors.bg}`, 
            borderTop: `5px solid ${colors.primary}`, 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{color: colors.primary}}>Analyzing Contract...</h2>
          <p style={{color: '#666'}}>Extracting text, running heuristic rules, and querying LLMs.</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {result && (
        <div style={{display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px'}}>
          {/* Sidebar */}
          <div>
            <div style={styles.card}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'}}>
                <Gauge score={result.overall_risk_score} />
                <div style={{marginTop: '10px', fontWeight: 'bold'}}>Overall Risk Score</div>
              </div>
              <div style={{borderTop: '1px solid #eee', paddingTop: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span>Critical Flags</span>
                  <span style={{fontWeight: 'bold', color: colors.danger}}>{result.flags.filter(f => f.severity === 'CRITICAL').length}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span>High Flags</span>
                  <span style={{fontWeight: 'bold', color: colors.warning}}>{result.flags.filter(f => f.severity === 'HIGH').length}</span>
                </div>
              </div>
              <button 
                onClick={() => {setResult(null); setFile(null);}} 
                style={{...styles.button, width: '100%', justifyContent: 'center', marginTop: '20px', background: '#eee', color: '#333'}}
              >
                Analyze New File
              </button>
            </div>

            <div style={styles.card}>
              <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Cpu size={18} /> Extracted Clauses
              </h3>
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                {Object.entries(result.extracted_clauses).length === 0 ? (
                    <div style={{color: '#888', fontStyle: 'italic'}}>No standard clauses found.</div>
                ) : (
                    Object.entries(result.extracted_clauses).map(([key, sentences]) => (
                    <div key={key} style={{marginBottom: '15px'}}>
                        <div style={{fontWeight: 'bold', fontSize: '0.85rem', color: colors.primary, marginBottom: '4px', textTransform: 'capitalize'}}>
                        {key.replace(/_/g, ' ')}
                        </div>
                        <div style={{fontSize: '0.75rem', color: '#555', paddingLeft: '8px', borderLeft: `2px solid ${colors.info}`}}>
                        {(sentences as string[]).length} occurrence(s)
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h2 style={{margin: 0}}>Analysis Report</h2>
              <div style={{fontSize: '0.9rem', color: '#666'}}>{result.flags.length} risks identified</div>
            </div>

            {result.flags.length === 0 ? (
              <div style={{...styles.card, textAlign: 'center', padding: '40px'}}>
                <CheckCircle size={48} color={colors.success} />
                <h3>No Significant Red Flags Found</h3>
                <p>The contract appears to be standard based on our current rule set.</p>
              </div>
            ) : (
              result.flags
                .sort((a, b) => b.score - a.score)
                .map((flag, idx) => (
                  <FlagCard key={idx} flag={flag} />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);