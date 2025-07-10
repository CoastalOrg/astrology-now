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
    <div className={`${maxHeight} overflow-y-auto`}>
      <h3 className="flex items-center gap-2 text-lg font-medium text-nova-text-primary mb-4">
        <Clock className="h-5 w-5 text-nova-text-secondary" />
        {title}
      </h3>
      
      <Accordion type="multiple" className="space-y-2">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="border border-white/20 rounded-lg px-4 bg-white/5 backdrop-blur-sm"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex-1 text-left">
                  <div className="font-medium text-nova-text-primary text-sm mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-nova-text-secondary truncate max-w-md">
                    {item.preview}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {item.badge && (
                    <Badge 
                      variant={item.badge.variant || 'secondary'}
                      className="text-xs bg-nova-action/20 text-nova-action border-nova-action/30"
                    >
                      {item.badge.label}
                    </Badge>
                  )}
                  <div className="text-xs text-nova-text-secondary">
                    {new Date(item.timestamp).toLocaleDateString()}
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