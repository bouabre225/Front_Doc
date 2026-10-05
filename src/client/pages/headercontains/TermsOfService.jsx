import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '../../context/LangContext';

const TermsOfService = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const L = t.legal;

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100 text-gray-800 leading-relaxed">
      <span onClick={() => navigate(-1)} className="cursor-pointer text-gray-600 no-underline flex items-center gap-2 pb-6">
        <ArrowLeft size={16} /> {L.back}
      </span>
      <header className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold text-green-900">{L.termsTitle}</h1>
        <p className="text-sm text-gray-500 mt-2">{L.termsVersion}</p>
      </header>

      <section className="space-y-6">
        {L.termsSections.map((s, i) => (
          <div key={i}>
            <h2 className="text-xl font-semibold text-green-800 mb-2 font-mono uppercase tracking-wide">{s.h}</h2>
            {s.body && <p>{s.body}</p>}
            {s.list && (
              <ul className="list-disc pl-6 space-y-2">
                {s.list.map((li, j) => <li key={j}>{li}</li>)}
              </ul>
            )}
            {s.olist && (
              <ol className="list-decimal pl-6 space-y-2 mt-2">
                {s.olist.map((li, j) => <li key={j}>{li}</li>)}
              </ol>
            )}
          </div>
        ))}

        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 italic">
          <strong>{L.termsNoteTitle}</strong> {L.termsNote}
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-center text-gray-400 text-sm">
        {L.supportContact} docspaceafrica@gmail.com
      </footer>
    </div>
  );
};

export default TermsOfService;
