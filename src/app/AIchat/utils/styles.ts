export const globalStyles = `
  @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
  .animate-fade-in { animation: fade-in 0.5s ease-out }
  .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards }
  .animate-slow { animation-duration: 3s }
  .animate-delay-100 { animation-delay: 0.1s }
  .animate-delay-200 { animation-delay: 0.2s }
  ::-webkit-scrollbar { width: 8px }
  ::-webkit-scrollbar-track { background: #f1f5f9 }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8 }
`;