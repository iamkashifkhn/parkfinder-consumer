"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    question: "How early should I arrive at the parking facility?",
    answer: "We recommend arriving at least 30 minutes before your intended airport arrival time. This allows sufficient time for parking, unloading luggage, and catching the shuttle to your terminal."
  },
  {
    question: "Is the parking facility secure?",
    answer: "Yes, all our parking facilities are equipped with 24/7 security surveillance, well-lit areas, and regular security patrols. We also provide insurance coverage for additional peace of mind."
  },
  {
    question: "How frequently do shuttle buses run?",
    answer: "Our shuttle services run every 15-20 minutes during peak hours (4:00 AM - 12:00 AM) and every 30 minutes during off-peak hours. The journey to the terminal typically takes 5-10 minutes."
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "Don't worry! We understand that flights can be unpredictable. Your parking duration is calculated based on your actual return time, and any additional charges will be calculated at our standard daily rate."
  },
  {
    question: "Can I modify or cancel my booking?",
    answer: "Yes, you can modify or cancel your booking up to 24 hours before your scheduled arrival time. Changes can be made through your account dashboard or by contacting our customer service."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Google Pay. Payment can be made online during booking or at the parking facility."
  },
  {
    question: "Is there a height restriction for vehicles?",
    answer: "Most of our facilities can accommodate vehicles up to 2.1 meters in height. If you have a larger vehicle, please contact us in advance to check availability at specific locations."
  },
  {
    question: "What if I lose my parking ticket?",
    answer: "If you lose your parking ticket, please contact our on-site staff or customer service. We can verify your booking through your reservation details and provide assistance."
  }
];

export default function HelpPage() {
  return <Help />;
}

export function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold  mx-auto text-center mb-12">
            <span className="text-gray-700">Frequently</span>
            <span className="text-blue-600"> Asked Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our airport parking services
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <Input
            type="search"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <Accordion type="single" collapsible className="w-full mt-10 mb-10 max-w-3xl mx-auto">
          {filteredFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredFaqs.length === 0 && (
          <Card className="p-4 text-center text-muted-foreground">
            No FAQs found matching your search.
          </Card>
        )}

        <div className="text-center space-y-4 pt-8">
          <h2 className="text-2xl font-semibold">Still have questions?</h2>
          <p className="text-muted-foreground">
            Can&apos;t find the answer you&apos;re looking for? Please contact our customer support.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@smartparking.com"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    
  );
}