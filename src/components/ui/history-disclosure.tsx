import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  content: string;
  timestamp: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface HistoryDisclosureProps {
  title: string;
  items: HistoryItem[];
  maxHeight?: string;
  emptyMessage?: string;
}

export const HistoryDisclosure: React.FC<HistoryDisclosureProps> = ({
  title,
  items,
  maxHeight = 'max-h-96',
  emptyMessage = 'No history available'
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-nova-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`${maxHeight} overflow-y-auto w-full`}>
      <h3 className="flex items-center gap-2 text-base sm:text-lg font-medium text-nova-text-primary mb-3 sm:mb-4 px-1">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-nova-text-secondary flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
      
      <Accordion type="multiple" className="space-y-2 w-full">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border border-white/20 rounded-lg px-2 sm:px-4 bg-white/5 backdrop-blur-sm w-full"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-2 sm:pr-4 gap-2 sm:gap-0">
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-nova-text-primary text-sm mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-nova-text-secondary line-clamp-2 overflow-hidden text-ellipsis leading-relaxed">
                    {item.preview}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-0 sm:ml-4 flex-shrink-0">
                  {item.badge && (
                    <Badge 
                      variant={item.badge.variant || 'secondary'}
                      className="text-xs bg-nova-action/20 text-nova-action border-nova-action/30 hidden sm:inline-flex"
                    >
                      {item.badge.label}
                    </Badge>
                  )}
                  <div className="text-xs text-nova-text-secondary whitespace-nowrap">
                    <span className="hidden sm:inline">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span className="sm:hidden">
                      {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="text-nova-text-secondary text-sm leading-relaxed">
                {item.content}
              </div>
              <div className="text-xs text-nova-text-secondary mt-3 pt-3 border-t border-white/10">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};