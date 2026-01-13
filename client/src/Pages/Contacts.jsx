import { useState } from "react";

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      value: "contact@devconnect.local",
      link: "mailto:contact@devconnect.local",
    },
    {
      icon: "💬",
      title: "Support",
      value: "support@devconnect.local",
      link: "mailto:support@devconnect.local",
    },
    {
      icon: "🐙",
      title: "GitHub",
      value: "github.com/devconnect",
      link: "https://github.com/devconnect",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold heading-gradient mb-4">Get In Touch</h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto">
          Have a question or want to work together? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Methods */}
        <div className="lg:col-span-1 space-y-4">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              target={method.link.startsWith("http") ? "_blank" : undefined}
              rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="block card-surface p-6 rounded-xl hover:scale-[1.02] transition-transform duration-200"
            >
              <div className="text-3xl mb-3">{method.icon}</div>
              <h3 className="text-lg font-semibold text-primary mb-1">
                {method.title}
              </h3>
              <p className="text-secondary text-sm">{method.value}</p>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="card-surface p-8 rounded-xl">
            <h2 className="text-2xl font-bold heading-gradient mb-6">
              Send us a message
            </h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-sm text-center">
                  Thank you! Your message has been sent.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-secondary mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Your message..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-semibold hover:shadow-lg hover:shadow-[#10b981]/20 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
