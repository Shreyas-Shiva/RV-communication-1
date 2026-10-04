import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle, MapPin, Building2 } from 'lucide-react';
import { Button } from '../components/Button';
import siteConfig from '../site.config.json';

interface ContactPageProps {
  onBack: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [category, setCategory] = useState<string>('feedback');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Simulate clean local dispatch or mailto
    const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`[COMMUNIQ ${category}] Feedback`)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}`
    )}`;
    window.open(mailto, '_blank');
    setSubmitted(true);
  };

  return (
    <article className="max-w-4xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <Mail className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              Contact COMMUNIQ
            </h1>
            <p className="text-sm font-semibold text-[#0A6C6E]">
              We welcome questions, feedback, and native language suggestions.
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="space-y-4">
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-4 text-xs">
            <h3 className="text-base font-black text-[#1F1B16]">Official Contact Details</h3>
            
            <div className="space-y-1">
              <span className="font-bold text-[#085557] flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Maintainer
              </span>
              <p className="text-[#5E564D]">{siteConfig.makerName}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#085557] flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Support Email
              </span>
              <p className="text-[#5E564D] font-bold">{siteConfig.contactEmail}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#085557] flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Address
              </span>
              <p className="text-[#5E564D] leading-relaxed">{siteConfig.physicalAddress}</p>
            </div>
          </div>

          <div className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-4 text-xs text-[#5E564D] leading-relaxed">
            <strong className="text-[#1F1B16] block font-bold mb-1">Privacy Notice:</strong>
            Sending feedback opens your email client directly. We do not store tracking cookies or monitor your submission.
          </div>
        </div>

        {/* Feedback Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-[#EBF7EF] border-2 border-[#1B7A42] rounded-[14px] p-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-[#1B7A42] mx-auto" />
              <h3 className="text-2xl font-black text-[#1F1B16]">Thank you!</h3>
              <p className="text-sm font-semibold text-[#1E4620]">
                Your feedback email was opened in your email client. Thank you for helping us improve COMMUNIQ.
              </p>
              <Button variant="secondary" size="normal" onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-6 space-y-4">
              <div className="space-y-1">
                <label htmlFor="contact-category" className="text-xs font-bold uppercase text-[#5E564D]">
                  Topic / Category
                </label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 border-2 border-[#E5DACF] rounded-[10px] font-bold text-sm bg-white focus:border-[#0A6C6E]"
                >
                  <option value="feedback">General Feedback</option>
                  <option value="translation">Translation Correction (Kannada / Hindi)</option>
                  <option value="accessibility">Accessibility Barrier</option>
                  <option value="support">Technical Support</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-xs font-bold uppercase text-[#5E564D]">
                    Your Name (Optional)
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full min-h-[46px] px-3.5 border-2 border-[#E5DACF] rounded-[10px] text-sm font-medium focus:border-[#0A6C6E]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-xs font-bold uppercase text-[#5E564D]">
                    Your Email (Optional)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[46px] px-3.5 border-2 border-[#E5DACF] rounded-[10px] text-sm font-medium focus:border-[#0A6C6E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="text-xs font-bold uppercase text-[#5E564D]">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help or improve COMMUNIQ?"
                  className="w-full p-3.5 border-2 border-[#E5DACF] rounded-[10px] text-sm font-medium focus:border-[#0A6C6E]"
                />
              </div>

              <Button
                variant="primary"
                size="large"
                type="submit"
                icon={<Send className="w-5 h-5 text-white" />}
              >
                Send Message via Email
              </Button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
};
