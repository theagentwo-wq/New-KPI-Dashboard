
import { View, Period } from '../types';
import { getPeriodOptions } from '../utils/dateUtils';

interface HeaderProps {
  activeView: View;
  activePeriod: Period;
  setActivePeriod: (period: Period) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, activePeriod, setActivePeriod }) => {
  const periodOptions = getPeriodOptions();

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = event.target.value;
    const newPeriod = periodOptions.find(p => p.label === selectedLabel);
    if (newPeriod) {
      setActivePeriod(newPeriod);
    }
  };

  return (
    <header className="bg-slate-800/50 p-4 flex justify-between items-center border-b border-slate-700">
      <h1 className="text-xl font-bold text-white">{activeView}</h1>
      <div>
        <select 
          value={activePeriod.label} 
          onChange={handlePeriodChange}
          className="bg-slate-900 border-slate-700 rounded-md p-2 text-white"
        >
          {periodOptions.map(period => (
            <option key={period.label} value={period.label}>
              {period.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
