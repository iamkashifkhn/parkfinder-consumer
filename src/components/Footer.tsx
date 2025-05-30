'use client';

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Download, ChevronRight, Globe, Apple } from "lucide-react";
import { BRANDING } from "@/constants/branding";
import { useEffect, useState } from "react";
import Image from "next/image";

// Creating a client-only component for the copyright year
const CopyrightYear = () => {
  const [year, setYear] = useState("");
  
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  
  return <span>{year}</span>;
};

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter Section */}
      {/* <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">New Things Will Always</h2>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Update Regularly</h2>
            </div>
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-5 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-6 py-2">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
          {/* Company Info Column */}
          <div className="md:col-span-2">
            {/* <Link href="/" className="inline-block mb-6">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white font-bold text-xl p-2 rounded">Park</div>
                <div className="font-bold text-xl">Finder24</div>
              </div>
            </Link> */}

            <Link href="/" className="flex gap-2 mb-6">
          <span className="sr-only">{BRANDING.COMPANY_NAME}</span>
          <Image
            className="h-8 w-auto"
            src="/images/logo.svg"
            alt={BRANDING.COMPANY_NAME}
            width={120}
            height={32}
            priority
          />
          <span className="text-lg font-semibold text-gray-900">{BRANDING.COMPANY_NAME}</span>
        </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 pr-4">
              {BRANDING.COMPANY_TAGLINE}. 
              ParkFinder24 is the heart of the parking community and the best resource to discover and connect with parking spots worldwide.
            </p>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-5">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-600 text-sm hover:text-blue-600">About us</Link></li>
              <li><Link href="/contact" className="text-gray-600 text-sm hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>

          {/* Help Links Column */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-5">Help & Support</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-gray-600 text-sm hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-gray-600 text-sm hover:text-blue-600">Terms & Conditions</Link></li>
              <li><Link href="/cancellation-policy" className="text-gray-600 text-sm hover:text-blue-600">Cancellation Policy</Link></li>
              <li><Link href="/imprint" className="text-gray-600 text-sm hover:text-blue-600">Imprint</Link></li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/search" className="text-gray-600 text-sm hover:text-blue-600">Find Parking</Link></li>
              <li><Link href="/blog" className="text-gray-600 text-sm hover:text-blue-600">Blog</Link></li>
              <li><Link href="/become-a-partner" className="text-gray-600 text-sm hover:text-blue-600">Become a Partner</Link></li>
              <li><Link href="/faq" className="text-gray-600 text-sm hover:text-blue-600">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Download App Section - Commented out as per user preference */}
        {/* <div className="border-t border-gray-200 pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-3">Download App</h3>
              <p className="text-gray-600 text-sm">
                Download our Apps and get extra 15% Discount on your first Booking...!
              </p>
            </div>
            <div className="flex space-x-4 justify-end">
              <Link href="#" className="flex items-center justify-center bg-black text-white rounded-lg px-4 py-2">
                <Apple className="w-5 h-5 mr-2" />
                <div>
                  <div className="text-[10px]">Download on the</div>
                  <div className="text-xs font-bold">App Store</div>
                </div>
              </Link>
              <Link href="#" className="flex items-center justify-center bg-black text-white rounded-lg px-4 py-2">
                <Globe className="w-5 h-5 mr-2" />
                <div>
                  <div className="text-[10px]">Get it on</div>
                  <div className="text-xs font-bold">Google Play</div>
                </div>
              </Link>
            </div>
          </div>
        </div> */}

        {/* Copyright Section */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-xs mb-4 md:mb-0">
            Copyright &copy; <CopyrightYear /> {BRANDING.COPYRIGHT_TEXT}
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-600 text-xs hover:text-blue-600">Privacy Policy</Link>
            <Link href="/terms-conditions" className="text-gray-600 text-xs hover:text-blue-600">Terms & Conditions</Link>
            <Link href="/security" className="text-gray-600 text-xs hover:text-blue-600">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}; 