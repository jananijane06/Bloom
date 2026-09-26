import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export interface PromptCardProps {
  id: string;
  category: string;
  prompt: string;
  tag: string;
  onUsePrompt: (prompt: string, tag: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  category,
  prompt,
  tag,
  onUsePrompt,
}) => {
  return (
    <GlassCard variant="glow" className="p-5 flex flex-col justify-between h-full border-primary/20">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="primary" size="sm" dot>
            {category}
          </Badge>
          <span className="text-primary font-bold text-sm">✦</span>
        </div>
        <p className="editorial text-[17px] text-on-surface leading-relaxed">
          "{prompt}"
        </p>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/60">
        <span className="text-[11px] text-outline font-medium">#{tag}</span>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onUsePrompt(prompt, tag)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5 text-primary" />}
        >
          Reflect
        </Button>
      </div>
    </GlassCard>
  );
};

export default PromptCard;
