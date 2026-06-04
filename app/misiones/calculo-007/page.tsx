"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function Mision007() {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  
  // Configuración
  const [qTotal, setQTotal] = useState(30);
  const [timeTotal, setTimeTotal] = useState(60);
  const [digitsCount, setDigitsCount] = useState(2);
  const [ops, setOps] = useState({ add: true, sub: true, mul: true });

  // Estado del juego
  const [timeLeft, setTimeLeft] = useState(0);
  const [qCurrent, setQCurrent] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [incorrectas, setIncorrectas] = useState(0);
  const [problem, setProblem] = useState({ num1: 0, num2: 0, op: '', answer: 0 });
  const [userInput, setUserInput] = useState("");
  const [defused, setDefused] = useState(false);

  // Audio Context (referencia para no recrearlo en cada render)
  const playBeep = useCallback((freq: number, type: OscillatorType) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio no soportado o bloqueado");
    }
  }, []);

  const hablar = (texto: string) => {
    if ('speechSynthesis' in window) {
      const mensaje = new SpeechSynthesisUtterance(texto);
      mensaje.lang = 'es-ES';
      mensaje.rate = 1.1;
      window.speechSynthesis.speak(mensaje);
    }
  };

  const generateProblem = useCallback(() => {
    const activeOps = [];
    if (ops.add) activeOps.push('+');
    if (ops.sub) activeOps.push('-');
    if (ops.mul) activeOps.push('*');

    const maxNum = Math.pow(10, digitsCount) - 1;
    let n1 = Math.floor(Math.random() * maxNum) + 1;
    let n2 = Math.floor(Math.random() * maxNum) + 1;
    const operation = activeOps[Math.floor(Math.random() * activeOps.length)];

    if (operation === '-' && n2 > n1) {
      const temp = n1; n1 = n2; n2 = temp;
    }

    if (operation === '*' && digitsCount > 1) {
      n2 = Math.floor(Math.random() * 9) + 2;
    }

    let ans = 0;
    if (operation === '+') ans = n1 + n2;
    if (operation === '-') ans = n1 - n2;
    if (operation === '*') ans = n1 * n2;

    setProblem({ num1: n1, num2: n2, op: operation === '*' ? 'x' : operation, answer: ans });
    setUserInput("");
  }, [digitsCount, ops]);

  const startGame = () => {
    if (!ops.add && !ops.sub && !ops.mul) return alert("¡Selecciona al menos una operación!");
    
    setTimeLeft(timeTotal);
    setQCurrent(0);
    setCorrectas(0);
    setIncorrectas(0);
    setDefused(false);
    generateProblem();
    setGameState('playing');
  };

  // Temporizador principal
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      endGame(false);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 11) playBeep(800, 'square');
        else playBeep(400, 'sine');
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, gameState, playBeep]);

  const checkAnswer = () => {
    if (userInput === "") return;
    
    if (parseInt(userInput) === problem.answer) {
      setCorrectas(prev => prev + 1);
    } else {
      setIncorrectas(prev => prev + 1);
    }
    
    const nextQ = qCurrent + 1;
    setQCurrent(nextQ);
    
    if (nextQ >= qTotal) {
      endGame(true);
    } else {
      generateProblem();
    }
  };

  const endGame = (isDefused: boolean) => {
    setDefused(isDefused);
    setGameState('result');
    
    if (isDefused) {
      hablar("¡Bomba desactivada! Excelente trabajo, agente.");
    } else {
      hablar("Misión fallida. La bomba ha detonado.");
    }
  };

  const pressKey = (key: string) => {
    if (key === 'DEL') {
      setUserInput(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      checkAnswer();
    } else {
      if (userInput.length < 6) setUserInput(prev => prev + key);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  if (gameState === 'setup') {
    return (
      <main className="min-h-screen bg-neutral-950 text-green-500 font-mono p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full border-2 border-green-500/50 rounded-xl p-6 bg-black shadow-[0_0_20px_rgba(0,255,0,0.1)]">
          <Link href="/" className="text-sm text-green-400/60 hover:text-green-400 mb-4 inline-block">← Volver al Cuartel</Link>
          <h1 className="text-2xl font-bold text-center mb-6">CONFIGURACIÓN 007</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <label>Ejercicios:</label>
              <input type="number" value={qTotal} onChange={(e) => setQTotal(Number(e.target.value))} className="bg-neutral-900 border border-green-500 rounded p-2 w-20 text-center" />
            </div>
            <div className="flex justify-between items-center">
              <label>Tiempo (seg):</label>
              <input type="number" value={timeTotal} onChange={(e) => setTimeTotal(Number(e.target.value))} className="bg-neutral-900 border border-green-500 rounded p-2 w-20 text-center" />
            </div>
            <div className="flex justify-between items-center">
              <label>Dígitos Max:</label>
              <input type="number" value={digitsCount} onChange={(e) => setDigitsCount(Number(e.target.value))} className="bg-neutral-900 border border-green-500 rounded p-2 w-20 text-center" max={4} min={1} />
            </div>
            
            <div className="pt-4 border-t border-green-900">
              <label className="flex items-center space-x-3 mb-2 cursor-pointer">
                <input type="checkbox" checked={ops.add} onChange={(e) => setOps({...ops, add: e.target.checked})} className="w-5 h-5 accent-green-500" />
                <span>Suma (+)</span>
              </label>
              <label className="flex items-center space-x-3 mb-2 cursor-pointer">
                <input type="checkbox" checked={ops.sub} onChange={(e) => setOps({...ops, sub: e.target.checked})} className="w-5 h-5 accent-green-500" />
                <span>Resta (-)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={ops.mul} onChange={(e) => setOps({...ops, mul: e.target.checked})} className="w-5 h-5 accent-green-500" />
                <span>Multiplicación (x)</span>
              </label>
            </div>
          </div>
          
          <button onClick={startGame} className="w-full bg-green-900/40 hover:bg-green-800/60 border-2 border-green-500 text-green-400 font-bold py-4 rounded-lg transition-colors text-xl">
            INICIAR MISIÓN
          </button>
        </div>
      </main>
    );
  }

  if (gameState === 'playing') {
    const isUrgent = timeLeft <= 10;
    return (
      <main className="min-h-screen bg-neutral-950 text-green-500 font-mono p-4 flex flex-col items-center select-none">
        <div className="max-w-md w-full flex-1 flex flex-col pt-4">
          
          <div className="flex justify-between items-center bg-black border border-green-500/30 p-3 rounded-lg mb-6">
            <div className={`text-2xl font-bold ${isUrgent ? 'text-red-500 animate-pulse' : ''}`}>
              ⏱️ {timeLeft}s
            </div>
            <div className="text-xl">
              🎯 {qCurrent}/{qTotal}
            </div>
          </div>

          <div className={`text-center text-6xl mb-6 ${isUrgent ? 'animate-bounce' : ''}`}>💣</div>
          
          <div className="flex-1 flex flex-col items-center justify-center mb-6">
            <div className="text-5xl font-bold tracking-wider mb-8">
              {problem.num1} {problem.op} {problem.num2}
            </div>
            <div className="w-full h-16 bg-black border-b-4 border-green-500 text-4xl text-center flex items-center justify-center">
              {userInput || <span className="opacity-30">...</span>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {['1','2','3','4','5','6','7','8','9','DEL','0','ENTER'].map((btn) => (
              <button 
                key={btn}
                onClick={() => pressKey(btn)}
                className={`py-5 text-2xl font-bold rounded-lg active:scale-95 transition-transform ${
                  btn === 'DEL' ? 'bg-red-900/40 text-red-500 border border-red-500/50' : 
                  btn === 'ENTER' ? 'bg-green-800 text-black border border-green-400' : 
                  'bg-neutral-900 border border-green-500/30 text-green-400 active:bg-green-500 active:text-black'
                }`}
              >
                {btn === 'ENTER' ? 'OK' : btn}
              </button>
            ))}
          </div>

        </div>
      </main>
    );
  }

  // gameState === 'result'
  let score = (correctas * 10) - (incorrectas * 5) + (timeLeft * 2);
  if (score < 0) score = 0;
  if (!defused) score = Math.floor(score / 2);

  const accuracy = (correctas / qTotal) * 100;
  let stars = "⭐";
  if (accuracy >= 90 && defused) stars = "⭐⭐⭐";
  else if (accuracy >= 70 && defused) stars = "⭐⭐";
  else if (!defused) stars = "❌";

  return (
    <main className="min-h-screen bg-neutral-950 font-mono p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full border-2 border-green-500/50 rounded-xl p-8 bg-black text-center">
        <h1 className={`text-3xl font-bold mb-4 ${defused ? 'text-green-500' : 'text-red-500'}`}>
          {defused ? 'MISIÓN COMPLETADA' : 'TIEMPO AGOTADO'}
        </h1>
        
        <div className="text-6xl mb-4">{defused ? '🕵️‍♂️' : '💥'}</div>
        <div className="text-4xl mb-6">{stars}</div>
        
        <div className="bg-neutral-900 border border-green-900 p-4 rounded-lg mb-8 text-left text-green-400 space-y-2">
          <p>✅ Correctas: <span className="float-right text-white">{correctas}</span></p>
          <p>❌ Incorrectas: <span className="float-right text-white">{incorrectas}</span></p>
          <p>⏱️ Tiempo sobra: <span className="float-right text-white">{timeLeft}s</span></p>
          <div className="border-t border-green-800 mt-2 pt-2 text-xl font-bold">
            🏆 PUNTAJE TOTAL: <span className="float-right text-green-500">{score}</span>
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={() => setGameState('setup')} className="w-full bg-green-900/40 border border-green-500 text-green-400 py-3 rounded hover:bg-green-800">
            NUEVA MISIÓN
          </button>
          <Link href="/" className="block w-full bg-neutral-900 border border-neutral-700 text-neutral-400 py-3 rounded hover:bg-neutral-800">
            VOLVER AL CUARTEL
          </Link>
        </div>
      </div>
    </main>
  );
}