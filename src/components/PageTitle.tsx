
interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        {icon && <div className="mr-3 text-cyan-400">{icon}</div>}
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>
      {subtitle && <p className="text-slate-400 mt-1 text-lg">{subtitle}</p>}
    </div>
  );
};
