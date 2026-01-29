"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "./Button";
import { Card } from "./Card";

interface BarcodeReaderProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeReader({ onScan, onClose }: BarcodeReaderProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.7777778,
        formatsToSupport: [
          0, // CODE_128 (usado em boletos)
          1, // CODE_39
          8, // ITF (Interleaved 2 of 5 - boletos antigos)
        ],
      };

      await scanner.start(
        { facingMode: "environment" }, // Câmera traseira
        config,
        (decodedText) => {
          // Sucesso na leitura
          console.log("Código lido:", decodedText);
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Erro na leitura (normal durante escaneamento)
          // Não mostramos esses erros ao usuário
        }
      );
    } catch (err: any) {
      console.error("Erro ao iniciar scanner:", err);
      setError(
        "Não foi possível acessar a câmera. Verifique as permissões."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Erro ao parar scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📷 Escanear Boleto
          </h2>
          <p className="text-gray-600">
            Posicione o código de barras do boleto na área indicada
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        <div
          id="barcode-reader"
          ref={containerRef}
          className="w-full rounded-lg overflow-hidden mb-4"
          style={{ minHeight: "300px" }}
        />

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>💡 Dicas:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Mantenha o boleto bem iluminado</li>
              <li>Posicione o código de barras horizontalmente</li>
              <li>Mantenha distância de ~15-20cm da câmera</li>
              <li>Evite reflexos e sombras</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              ❌ Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
