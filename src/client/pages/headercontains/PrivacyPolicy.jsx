import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '../../context/LangContext';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const L = t.legal;

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100 text-gray-800 leading-relaxed">
      <span onClick={() => navigate(-1)} className="cursor-pointer text-gray-600 no-underline flex items-center gap-2 pb-6">
        <ArrowLeft size={16} /> {L.back}
      </span>
      <header className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold text-green-900">{L.privacyTitle}</h1>
        <p className="text-sm text-gray-500 mt-2">{L.privacyUpdated}</p>
      </header>

      <section className="space-y-8">
        <div>
          <p className="bg-green-50 p-4 rounded-md text-green-800">
            {L.privacyIntroPre} <strong>docSpace</strong>, {L.privacyIntro}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">{L.p1}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold text-green-700">{L.p1aT}</h3>
              <p className="text-sm">{L.p1aD}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold text-green-700">{L.p1bT}</h3>
              <p className="text-sm">{L.p1bD}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">{L.p2}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {L.p2items.map(([b, txt], i) => (
              <li key={i}><strong>{b}</strong> {txt}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">{L.p3}</h2>
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">{L.p3h1}</th>
                <th className="border p-2">{L.p3h2}</th>
              </tr>
            </thead>
            <tbody>
              {L.p3rows.map(([d, dur], i) => (
                <tr key={i}>
                  <td className="border p-2">{d}</td>
                  <td className="border p-2">{dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">{L.p4}</h2>
          <p>{L.p4body}</p>
          <p className="mt-2 font-semibold">
            {L.p4dpo} <span className="text-blue-600 underline">docspaceafrica@gmail.com</span>
          </p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <strong>{L.p5}</strong> {L.p5body}
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
