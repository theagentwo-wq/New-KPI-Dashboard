
import { View } from '../types';

interface HeaderProps {
  activeView: View;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  return (
    <header className="bg-slate-800/50 p-4 flex justify-between items-center border-b border-slate-700">
      <h1 className="text-xl font-bold text-white">{activeView}</h1>
      <div className="text-sm text-slate-400">
        Use Store Rankings controls to change period
      </div>
    </header>
  );
};
