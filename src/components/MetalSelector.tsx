import { Metal } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MetalSelectorProps {
  metals: Metal[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const getMetalColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
    slate: { bg: 'bg-slate-400/10', text: 'text-slate-400', border: 'border-slate-400/30' },
    zinc: { bg: 'bg-zinc-300/10', text: 'text-zinc-300', border: 'border-zinc-300/30' },
    rose: { bg: 'bg-rose-400/10', text: 'text-rose-400', border: 'border-rose-400/30' },
    emerald: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-400/30' },
    blue: { bg: 'bg-blue-400/10', text: 'text-blue-400', border: 'border-blue-400/30' },
    purple: { bg: 'bg-purple-400/10', text: 'text-purple-400', border: 'border-purple-400/30' },
  };
  return colorMap[color] || colorMap.amber;
};

export const MetalSelector = ({ metals, value, onChange, label, className }: MetalSelectorProps) => {
  const selectedMetal = metals.find((m) => m.id === value);
  const colorClasses = selectedMetal ? getMetalColorClasses(selectedMetal.color) : getMetalColorClasses('amber');

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`border-border/50 bg-secondary ${colorClasses.border}`}>
          <SelectValue placeholder="Select metal" />
        </SelectTrigger>
        <SelectContent>
          {metals.map((metal) => {
            const colors = getMetalColorClasses(metal.color);
            return (
              <SelectItem key={metal.id} value={metal.id}>
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                    {metal.symbol}
                  </span>
                  <span>{metal.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export const MetalBadge = ({ metal, size = 'sm' }: { metal: Metal; size?: 'sm' | 'md' | 'lg' }) => {
  const colors = getMetalColorClasses(metal.color);
  const sizeClasses = {
    sm: 'h-5 w-5 text-[10px]',
    md: 'h-6 w-6 text-xs',
    lg: 'h-8 w-8 text-sm',
  };

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizeClasses[size]} ${colors.bg} ${colors.text}`}
      title={metal.name}
    >
      {metal.symbol}
    </span>
  );
};

export { getMetalColorClasses };
