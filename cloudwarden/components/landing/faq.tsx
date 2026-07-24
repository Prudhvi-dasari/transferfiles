'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
// We don't have @/lib/mock-data yet, so let's define them here or make sure to create that file.
// The prompt asked to import from @/lib/mock-data. I will create it after this file or just inline it if I have to.
import { faqItems } from '@/lib/mock-data';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="container-page py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item: { question: string, answer: string }, i: number) => (
            <div 
              key={i} 
              className="border border-border rounded-lg bg-card overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between font-medium text-left focus:outline-none focus-visible:bg-muted/50"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {item.question}
                <ChevronDown 
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200",
                    openIndex === i ? "rotate-180" : ""
                  )} 
                />
              </button>
              
              <div 
                className={cn(
                  "px-6 text-muted-foreground leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === i ? "py-4 max-h-96 opacity-100 border-t border-border" : "max-h-0 opacity-0 py-0"
                )}
              >
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
