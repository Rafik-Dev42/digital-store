import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Mail,
  MessageSquare,
  Send,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({ name, email, subject, message });
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Get in Touch
          </h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Have questions or need support? We&apos;re here to help. Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg">
              <div className="w-10 h-10 bg-[#ff5500]/10 rounded-lg flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-[#ff5500]" />
              </div>
              <h3 className="text-white font-medium mb-1">Email Us</h3>
              <p className="text-white/50 text-sm mb-2">
                For general inquiries and support
              </p>
              <a
                href="mailto:support@nexus.market"
                className="text-[#ff5500] text-sm hover:underline"
              >
                support@nexus.market
              </a>
            </div>

            <div className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg">
              <div className="w-10 h-10 bg-[#ff5500]/10 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-[#ff5500]" />
              </div>
              <h3 className="text-white font-medium mb-1">Response Time</h3>
              <p className="text-white/50 text-sm">
                We typically respond within 24 hours during business days.
              </p>
            </div>

            <div className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg">
              <div className="w-10 h-10 bg-[#ff5500]/10 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-[#ff5500]" />
              </div>
              <h3 className="text-white font-medium mb-1">Community</h3>
              <p className="text-white/50 text-sm mb-3">
                Join our community for faster help from fellow creators.
              </p>
              <Link
                to="/community"
                className="inline-flex items-center gap-1 text-[#ff5500] text-sm hover:underline"
              >
                Visit Community <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg">
              <div className="w-10 h-10 bg-[#ff5500]/10 rounded-lg flex items-center justify-center mb-3">
                <Phone className="w-5 h-5 text-[#ff5500]" />
              </div>
              <h3 className="text-white font-medium mb-1">Phone</h3>
              <p className="text-white/50 text-sm">
                +1 (555) 123-4567
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-white/50 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-[#ff5500] text-white text-sm font-medium rounded hover:bg-[#e64d00] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-semibold mb-6">
                    Send us a Message
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/70 text-sm mb-1.5 block">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-1.5 block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-1.5 block">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm mb-1.5 block">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff5500]"
                        placeholder="Describe your issue or question..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitContact.isPending}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#ff5500] text-white font-medium rounded-lg hover:bg-[#e64d00] transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitContact.isPending
                        ? "Sending..."
                        : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
