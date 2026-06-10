"use client";

import { useState, useEffect } from "react";
import { Calculator, ArrowDownToLine, Waves, Gauge, MessageCircle } from "lucide-react";
import { WHATSAPP_PHONE, buildWhatsAppUrl } from "@/lib/constants";

export default function PumpCalculator() {
  const [depth, setDepth] = useState<number | "">("");
  const [flow, setFlow] = useState<number | "">("");
  const [calculatedHp, setCalculatedHp] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<string>("");

  useEffect(() => {
    const d = Number(depth) || 0;
    const f = Number(flow) || 0; // liters per hour

    if (d > 0 && f > 0) {
      // Very simplified physics for UI:
      // Power (kW) = (Flow(m3/s) * Head(m) * Density * g) / efficiency
      // Let's use a simpler rule of thumb for domestic/agro sizing in HP
      // HP = (Q(L/min) * H(m)) / 4500 (approximate formula with efficiency built-in)
      
      const flowLmin = f / 60;
      // Add 20% head for friction losses
      const totalHead = d * 1.2; 
      
      let hp = (flowLmin * totalHead) / 3000; // Adjusted constant for realistic small pump sizing

      // Standardize to commercial sizes: 0.5, 0.75, 1, 1.5, 2, 3, 5.5
      const sizes = [0.5, 0.75, 1, 1.5, 2, 3, 5.5];
      let commercialHp = sizes.find((size) => size >= hp) || Math.ceil(hp);
      
      setCalculatedHp(commercialHp);

      if (d <= 8) {
        setRecommendation("Bomba de Superficie (Centrífuga o Autocebante)");
      } else {
        setRecommendation("Bomba Sumergible de Pozo Profundo");
      }
    } else {
      setCalculatedHp(0);
      setRecommendation("");
    }
  }, [depth, flow]);

  const whatsAppMessage = `Hola! Usé la calculadora de bombas y necesito una bomba de aprox ${calculatedHp} HP para una profundidad de ${depth}m y ${flow} L/h. Quisiera que me asesoren.`;
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_PHONE, whatsAppMessage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden my-8 font-sans">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex items-center gap-3 text-white">
        <Gauge className="h-6 w-6 text-indigo-200" />
        <h3 className="text-xl font-bold m-0 leading-none">Calculadora de Bombas de Agua</h3>
      </div>
      
      <div className="p-6 md:p-8">
        <p className="text-slate-600 mb-6 text-sm">
          Ingresá los datos de tu instalación para obtener una estimación de la potencia necesaria. Esta calculadora es una guía inicial; nuestro equipo validará el modelo exacto según cañerías y accesorios.
        </p>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profundidad de succión / Nivel de agua (metros)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowDownToLine className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={depth}
                onChange={(e) => setDepth(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 15"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Distancia vertical desde la bomba hasta el agua.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Caudal deseado (Litros por hora)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Waves className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                min="0"
                step="100"
                value={flow}
                onChange={(e) => setFlow(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 3000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Una casa promedio necesita entre 1500 y 3000 L/h.</p>
          </div>
        </div>

        {/* Results */}
        {calculatedHp > 0 && (
          <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-4">
              Resultado Estimado
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Potencia Sugerida</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-indigo-700">{calculatedHp}</span>
                  <span className="text-xl font-medium text-indigo-600/80">HP</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Tipo de Bomba Recomendada</p>
                <p className="text-lg font-medium text-slate-800 leading-snug">
                  {recommendation}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">Validá este resultado gratis</p>
                <p className="text-sm text-slate-500 mt-1">Escribinos y te confirmamos el modelo exacto sin compromiso.</p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-whatsapp-source="pump_calculator"
                className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm shadow-indigo-200"
              >
                <MessageCircle className="h-5 w-5" />
                Asesoramiento
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
