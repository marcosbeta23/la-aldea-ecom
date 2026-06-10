"use client";

import { useState, useEffect } from "react";
import { Calculator, Droplets, Package, MessageCircle } from "lucide-react";
import { WHATSAPP_PHONE, buildWhatsAppUrl } from "@/lib/constants";

export default function CloroCalculator() {
  const [inputType, setInputType] = useState<"dimensions" | "volume">("dimensions");
  const [length, setLength] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [depth, setDepth] = useState<number | "">("");
  const [volume, setVolume] = useState<number | "">("");
  const [calculatedVolume, setCalculatedVolume] = useState<number>(0);

  useEffect(() => {
    if (inputType === "dimensions") {
      const l = Number(length) || 0;
      const w = Number(width) || 0;
      const d = Number(depth) || 0;
      setCalculatedVolume(l * w * d * 1000); // meters to liters
    } else {
      setCalculatedVolume(Number(volume) || 0);
    }
  }, [length, width, depth, volume, inputType]);

  // General dosing rules
  const cloroGranulado = (calculatedVolume / 1000) * 10; // 10g per 1000L
  const cloroLiquido = (calculatedVolume / 1000) * 100; // 100ml per 1000L
  const pastillas = Math.max(0, Math.ceil(calculatedVolume / 20000)); // 1 per 20000L

  const whatsAppMessage = `Hola! Usé la calculadora de la web y mi piscina tiene ${calculatedVolume.toLocaleString()} litros. Quisiera consultar precios de cloro para esta medida.`;
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_PHONE, whatsAppMessage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden my-8 font-sans">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 flex items-center gap-3 text-white">
        <Calculator className="h-6 w-6 text-cyan-100" />
        <h3 className="text-xl font-bold m-0 leading-none">Calculadora de Cloro</h3>
      </div>
      
      <div className="p-6 md:p-8">
        {/* Toggle Input Type */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full max-w-sm mb-6">
          <button
            onClick={() => setInputType("dimensions")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              inputType === "dimensions" ? "bg-white shadow-sm text-blue-700" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Medidas (Largo x Ancho)
          </button>
          <button
            onClick={() => setInputType("volume")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              inputType === "volume" ? "bg-white shadow-sm text-blue-700" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Conozco los Litros
          </button>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {inputType === "dimensions" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Largo (metros)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 6"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ancho (metros)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Profundidad (metros)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 1.5"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-3 max-w-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">Volumen de la piscina (Litros)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={volume}
                onChange={(e) => setVolume(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 20000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          )}
        </div>

        {/* Results */}
        {calculatedVolume > 0 && (
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6">
            <div className="mb-6">
              <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Volumen Total</p>
              <p className="text-3xl font-bold text-blue-700">
                {calculatedVolume.toLocaleString()} <span className="text-xl font-normal text-blue-600/80">litros</span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                  <Package className="h-5 w-5 text-emerald-500" />
                  Cloro Granulado
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {cloroGranulado >= 1000 ? `${(cloroGranulado / 1000).toFixed(2)} kg` : `${cloroGranulado.toFixed(0)} gr`}
                </p>
                <p className="text-xs text-slate-500 mt-1">Dosis de mantenimiento diario</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Cloro Líquido
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {cloroLiquido >= 1000 ? `${(cloroLiquido / 1000).toFixed(2)} L` : `${cloroLiquido.toFixed(0)} ml`}
                </p>
                <p className="text-xs text-slate-500 mt-1">Dosis de mantenimiento diario</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                  <Package className="h-5 w-5 text-indigo-500" />
                  Pastillas (200g)
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {pastillas} {pastillas === 1 ? 'pastilla' : 'pastillas'}
                </p>
                <p className="text-xs text-slate-500 mt-1">En boya, repone 1 vez por semana</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-green-50 p-4 rounded-xl border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                ¿Necesitás cloro para la temporada?
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-whatsapp-source="cloro_calculator"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Consultar Precio
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
